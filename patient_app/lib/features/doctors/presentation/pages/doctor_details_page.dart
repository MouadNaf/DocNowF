import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/utils/colors.dart';
import '../../../home/domain/entities/doctor.dart';
import '../../../appointments/presentation/pages/book_appointment_page.dart';
import '../../../../injection_container.dart';
import '../../../../core/network/api_client.dart';

class DoctorDetailsPage extends StatefulWidget {
  final Doctor doctor;
  
  const DoctorDetailsPage({super.key, required this.doctor});

  @override
  State<DoctorDetailsPage> createState() => _DoctorDetailsPageState();
}

class _DoctorDetailsPageState extends State<DoctorDetailsPage> {
  String? _selectedTime;
  bool _isFavorite = false;
  bool _loadingSchedule = true;
  String? _scheduleError;
  List<String> _todaySlots = [];

  @override
  void initState() {
    super.initState();
    _isFavorite = widget.doctor.isFavorite;
    _loadTodaySchedule();
  }

  Future<void> _openMapDirections() async {
    final lat = widget.doctor.latitude;
    final lng = widget.doctor.longitude;
    if (lat.isEmpty || lng.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cabinet location coordinates are not set.')),
      );
      return;
    }

    final googleMapsUrl = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    final appleMapsUrl = Uri.parse('maps://?daddr=$lat,$lng');

    try {
      if (await canLaunchUrl(googleMapsUrl)) {
        await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(appleMapsUrl)) {
        await launchUrl(appleMapsUrl, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(googleMapsUrl, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      await launchUrl(googleMapsUrl, mode: LaunchMode.platformDefault);
    }
  }

  Future<void> _toggleFavorite() async {
    final oldStatus = _isFavorite;
    setState(() => _isFavorite = !oldStatus);

    try {
      final apiClient = sl<ApiClient>();
      final response = await apiClient.post(
        '/favorites/toggle',
        body: {'doctor_id': widget.doctor.id},
      );

      if (!mounted) return;
      if (response.statusCode != 200) {
        setState(() => _isFavorite = oldStatus);
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => _isFavorite = oldStatus);
    }
  }

  Future<void> _loadTodaySchedule() async {
    setState(() {
      _loadingSchedule = true;
      _scheduleError = null;
    });

    try {
      final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final cabinetType = widget.doctor.cabinetType.isNotEmpty
          ? widget.doctor.cabinetType
          : 'private';
      final cabinetId = widget.doctor.cabinetId;

      final apiClient = sl<ApiClient>();
      final response = await apiClient.get(
        '/appointments/slots/${widget.doctor.id}/$today/$cabinetType/$cabinetId',
      );

      if (!mounted) return;
      if (response.statusCode == 200) {
        final Map<String, dynamic> decoded =
            json.decode(response.body) as Map<String, dynamic>;

        final List<dynamic> slots = (decoded['data']?['slots'] as List<dynamic>? ?? []);
        final available = slots
            .where((slot) => slot is Map<String, dynamic> && slot['is_available'] == true)
            .map((slot) => _toDisplayTime((slot as Map<String, dynamic>)['start']?.toString() ?? ''))
            .where((t) => t.isNotEmpty)
            .toList(growable: false);

        setState(() {
          _todaySlots = available;
          _selectedTime = available.isNotEmpty ? available.first : null;
          _loadingSchedule = false;
        });
      } else {
        setState(() {
          _scheduleError = 'Unable to load today schedule';
          _loadingSchedule = false;
        });
      }
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _scheduleError = 'Unable to load today schedule';
        _loadingSchedule = false;
      });
    }
  }

  String _toDisplayTime(String raw) {
    if (raw.isEmpty) return '';
    try {
      return DateFormat('hh:mm a').format(DateFormat('HH:mm:ss').parse(raw));
    } catch (_) {
      try {
        return DateFormat('hh:mm a').format(DateFormat('HH:mm').parse(raw));
      } catch (_) {
        return raw;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final orientation = MediaQuery.of(context).orientation;
    final isLandscape = orientation == Orientation.landscape;
    final headerHeight = isLandscape ? 200.0 : 350.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Main Content
          RefreshIndicator(
            color: AppColors.primary,
            onRefresh: _loadTodaySchedule,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeaderImage(headerHeight),
                _buildProfileCard(),
                _buildAboutSection(),
                _buildScheduleSection(),
                _buildLocationSection(),
                const SizedBox(height: 140), // Space for bottom bar
              ],
            ),
            ),
          ),
          
          // Back Button
          _buildTopButtons(),
          
          // Bottom Booking Bar
          _buildBottomAction(),
        ],
      ),
    );
  }

  Widget _buildHeaderImage(double height) {
    return Container(
      height: height,
      width: double.infinity,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: CachedNetworkImageProvider(widget.doctor.profilePicture),
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
        ),
      ),
    );
  }

  Widget _buildTopButtons() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
              ),
            ),
            GestureDetector(
              onTap: _toggleFavorite,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: _isFavorite ? Colors.red : AppColors.textPrimary,
                  size: 20,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard() {
    return Transform.translate(
      offset: const Offset(0, -40),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              widget.doctor.name,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              widget.doctor.specialty,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(Icons.work_outline, 'Experience', widget.doctor.experience),
                _buildStatItem(Icons.people_outline, 'Patients', widget.doctor.patients),
                _buildStatItem(Icons.attach_money_rounded, 'Fee', widget.doctor.fee),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String label, String value) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.primary, size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildAboutSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'About',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            widget.doctor.about,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, color: AppColors.textSecondary, size: 16),
              const SizedBox(width: 4),
              Text(
                widget.doctor.hospital,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleSection() {
    if (_loadingSchedule) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Available Schedule',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          if (_scheduleError != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.red.shade100),
              ),
              child: Text(
                _scheduleError!,
                style: const TextStyle(color: Colors.red),
              ),
            )
          else if (_todaySlots.isEmpty)
            const Text(
              'No available slots for today.',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            )
          else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              childAspectRatio: 2.2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _todaySlots.length,
            itemBuilder: (context, index) {
              final time = _todaySlots[index];
              final isSelected = _selectedTime == time;
              return GestureDetector(
                onTap: () => setState(() => _selectedTime = time),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : Colors.grey.shade200,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    time,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBottomAction() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(30),
            topRight: Radius.circular(30),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: Row(
          children: [
            _buildIconButton(Icons.chat_bubble_outline),
            const SizedBox(width: 12),
            _buildIconButton(Icons.videocam_outlined),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => BookAppointmentPage(doctor: widget.doctor),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Book Appointment',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconButton(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Icon(icon, color: AppColors.primary, size: 22),
    );
  }

  Widget _buildLocationSection() {
    final lat = widget.doctor.latitude;
    final lng = widget.doctor.longitude;
    
    // Default to Algiers if coordinates are empty
    final displayLat = lat.isNotEmpty ? lat : '36.7538';
    final displayLng = lng.isNotEmpty ? lng : '3.0588';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Cabinet Location',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            widget.doctor.address,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _openMapDirections,
            child: Container(
              height: 160,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Stack(
                  children: [
                    CachedNetworkImage(
                      imageUrl: 'https://static-maps.yandex.ru/1.x/?ll=$displayLng,$displayLat&z=15&l=map&size=450,160&pt=$displayLng,$displayLat,pm2rdm',
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                      placeholder: (context, url) => Container(
                        color: Colors.grey.shade100,
                        child: const Center(
                          child: CircularProgressIndicator(color: AppColors.primary),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey.shade100,
                        child: const Center(
                          child: Icon(Icons.map_outlined, size: 40, color: AppColors.textSecondary),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.directions, color: Colors.white, size: 18),
                            SizedBox(width: 6),
                            Text(
                              'Get Directions',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
