import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/utils/colors.dart';
import '../../../../core/widgets/bottom_navigation_bar.dart';
import '../../../home/domain/entities/doctor.dart';
import 'doctor_details_page.dart';

import '../../../../core/utils/navigation_service.dart';

class AllDoctorsPage extends StatefulWidget {
  final String? initialCategory;
  const AllDoctorsPage({super.key, this.initialCategory});

  @override
  State<AllDoctorsPage> createState() => _AllDoctorsPageState();
}

class _AllDoctorsPageState extends State<AllDoctorsPage> {
  String _selectedSort = 'Highest Rating';
  String _selectedAvailability = 'Available Today';
  String _selectedPriceRange = '';
  String _selectedDistance = '';
  bool _isGridView = false;
  bool _showFilters = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(Icons.arrow_back, color: AppColors.textPrimary, size: 20),
            ),
          ),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.initialCategory ?? 'All Doctors',
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
            Text(
              '12 doctors available',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildSortAndViewOptions(),
                const SizedBox(height: 16),
                if (_showFilters) ...[
                  _buildFilterSection(),
                  const SizedBox(height: 16),
                ],
              ],
            ),
          ),
          _buildDoctorsList(),
        ],
      ),
      bottomNavigationBar: CustomBottomNavigationBar(
        currentIndex: NavigationService.currentIndex.value,
        onTap: (index) {
          NavigationService.changeTab(index, context);
        },
      ),
    );
  }

  Widget _buildSortAndViewOptions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Text(
                    'Sort by:',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedSort,
                        isExpanded: true,
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                        items: ['Highest Rating', 'Lowest Rating', 'Nearest', 'Price: Low to High']
                            .map((sort) => DropdownMenuItem(
                                  value: sort,
                                  child: Text(sort),
                                ))
                            .toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedSort = value!;
                          });
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Row(
            children: [
              _buildViewToggle(Icons.tune_rounded, _showFilters, () {
                setState(() => _showFilters = !_showFilters);
              }),
              const SizedBox(width: 6),
              _buildViewToggle(Icons.view_list_rounded, !_isGridView, () {
                setState(() => _isGridView = false);
              }),
              const SizedBox(width: 6),
              _buildViewToggle(Icons.grid_view_rounded, _isGridView, () {
                setState(() => _isGridView = true);
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildViewToggle(IconData icon, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          size: 20,
          color: isActive ? Colors.white : AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildFilterSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildFilterGroup('Availability', [
          'Available Today',
          'Available Tomorrow',
          'This Week',
        ], _selectedAvailability),
        const SizedBox(height: 16),
        _buildFilterGroup('Price Range', [
          '\$0 - \$50',
          '\$50 - \$100',
          '\$100+',
        ], _selectedPriceRange),
        const SizedBox(height: 16),
        _buildFilterGroup('Distance', [
          'Within 2 km',
          'Within 5 km',
          'Any Distance',
        ], _selectedDistance),
      ],
    );
  }

  Widget _buildFilterGroup(String title, List<String> options, String selected) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 15,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: options.map((option) {
              final isSelected = selected == option;
              return Expanded(
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      if (title == 'Availability') {
                        _selectedAvailability = isSelected ? '' : option;
                      } else if (title == 'Price Range') {
                        _selectedPriceRange = isSelected ? '' : option;
                      } else if (title == 'Distance') {
                        _selectedDistance = isSelected ? '' : option;
                      }
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Text(
                      option,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildDoctorsList() {
    final doctors = [
      const Doctor(
        id: '1',
        userId: 'u1',
        name: 'Dr. Emily Williams',
        email: 'emily@example.com',
        specialty: 'Pediatrician',
        gender: 'Female',
        city: 'New York',
        address: '123 Medical Ave',
        dob: '1985-05-20',
        phoneNumber: '+1234567890',
        profilePicture: 'https://i.pravatar.cc/150?img=11',
        isVerified: true,
        isActive: true,
        rating: '5.0',
        reviews: '89',
        distance: '3.8 km',
        experience: '12 years',
        patients: '1,200+',
        fee: '\$70',
        about: 'Dr. Emily Williams is a board-certified pediatrician with over 12 years of experience in treating children from newborns to adolescents. She is known for her gentle approach and dedication to children\'s wellness.',
        hospital: 'NYC Children\'s Hospital',
        schedule: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
      ),
      const Doctor(
        id: '2',
        userId: 'u2',
        name: 'Dr. Amanda Foster',
        email: 'amanda@example.com',
        specialty: 'Gynecologist',
        gender: 'Female',
        city: 'New York',
        address: '456 Women Care St',
        dob: '1988-08-15',
        phoneNumber: '+1234567891',
        profilePicture: 'https://i.pravatar.cc/150?img=5',
        isVerified: true,
        isActive: true,
        rating: '5.0',
        reviews: '176',
        distance: '2.1 km',
        experience: '8 years',
        patients: '800+',
        fee: '\$90',
        about: 'Dr. Amanda Foster specializes in women\'s reproductive health. She provides comprehensive care for women through all stages of life, from adolescence through menopause.',
        hospital: 'Central Health Clinic',
        schedule: ['08:00 AM', '10:00 AM', '01:00 PM', '04:00 PM'],
      ),
      const Doctor(
        id: '3',
        userId: 'u3',
        name: 'Dr. Sarah Johnson',
        email: 'sarah@example.com',
        specialty: 'Cardiologist',
        gender: 'Female',
        city: 'Boston',
        address: '789 Heart Center',
        dob: '1980-03-10',
        phoneNumber: '+1234567892',
        profilePicture: 'https://i.pravatar.cc/150?img=9',
        isVerified: true,
        isActive: true,
        rating: '4.9',
        reviews: '127',
        distance: '2.5 km',
        experience: '15 years',
        patients: '2,500+',
        fee: '\$80',
        about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She specializes in preventive cardiology and has helped thousands of patients improve their cardiovascular health.',
        hospital: 'MediCare Hospital, New York',
        schedule: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
      ),
      const Doctor(
        id: '4',
        userId: 'u4',
        name: 'Dr. Michael Chen',
        email: 'michael@example.com',
        specialty: 'Dentist',
        gender: 'Male',
        city: 'San Francisco',
        address: '321 Dental Way',
        dob: '1990-11-25',
        phoneNumber: '+1234567893',
        profilePicture: 'https://i.pravatar.cc/150?img=15',
        isVerified: true,
        isActive: true,
        rating: '4.8',
        reviews: '203',
        distance: '1.2 km',
        experience: '6 years',
        patients: '1,500+',
        fee: '\$60',
        about: 'Dr. Michael Chen is a general dentist committed to providing excellent dental care in a comfortable environment. He specializes in cosmetic dentistry and oral hygiene.',
        hospital: 'Smile Dental Care',
        schedule: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
      ),
    ];

    final isLandscape = MediaQuery.of(context).orientation == Orientation.landscape;

    if (_isGridView) {
      return SliverPadding(
        padding: const EdgeInsets.all(16),
        sliver: SliverGrid(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isLandscape ? 4 : 2,
            childAspectRatio: 0.72,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
          ),
          delegate: SliverChildBuilderDelegate(
            (context, index) => _buildDoctorGridCard(doctors[index]),
            childCount: doctors.length,
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _buildDoctorListCard(doctors[index]),
          childCount: doctors.length,
        ),
      ),
    );
  }

  Widget _buildDoctorListCard(Doctor doctor) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DoctorDetailsPage(doctor: doctor),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: doctor.profilePicture,
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                  ),
                ),
                if (doctor.isActive)
                  Positioned(
                    right: 2,
                    bottom: 2,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    doctor.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    doctor.specialty,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, color: AppColors.star, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        '${doctor.rating} (${doctor.reviews})',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.location_on_outlined, color: AppColors.textSecondary, size: 14),
                      const SizedBox(width: 2),
                      Text(
                        doctor.distance,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        doctor.fee,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.primary,
                        ),
                      ),
                      const Text(
                        'Available Today',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorGridCard(Doctor doctor) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DoctorDetailsPage(doctor: doctor),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: doctor.profilePicture,
                    width: double.infinity,
                    height: 110,
                    fit: BoxFit.cover,
                  ),
                ),
                if (doctor.isActive)
                  Positioned(
                    right: 4,
                    bottom: 4,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              doctor.name,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppColors.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              doctor.specialty,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
              ),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.star_rounded, color: AppColors.star, size: 14),
                    const SizedBox(width: 2),
                    Text(
                      doctor.rating,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                Text(
                  doctor.fee,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
