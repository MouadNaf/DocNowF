import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../../core/utils/colors.dart';
import '../../../../injection_container.dart';
import '../../domain/entities/patient_appointment.dart';
import '../bloc/patient_appointments_bloc.dart';
import '../bloc/patient_appointments_event.dart';
import '../bloc/patient_appointments_state.dart';

class AppointmentsPage extends StatelessWidget {
  const AppointmentsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          sl<PatientAppointmentsBloc>()..add(const LoadPatientAppointmentsEvent()),
      child: const _AppointmentsView(),
    );
  }
}

class _AppointmentsView extends StatelessWidget {
  const _AppointmentsView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text(
          'My Appointments',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () => context
                .read<PatientAppointmentsBloc>()
                .add(const LoadPatientAppointmentsEvent()),
            icon: const Icon(Icons.refresh, color: AppColors.textPrimary),
          )
        ],
      ),
      body: BlocBuilder<PatientAppointmentsBloc, PatientAppointmentsState>(
        builder: (context, state) {
          if (state.loading && state.upcoming.isEmpty && state.past.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          return Column(
            children: [
              const SizedBox(height: 8),
              _TabSwitcher(
                showUpcoming: state.showUpcoming,
                onChanged: (showUpcoming) {
                  context
                      .read<PatientAppointmentsBloc>()
                      .add(ChangeAppointmentsTabEvent(showUpcoming: showUpcoming));
                },
              ),
              const SizedBox(height: 12),
              if (state.error != null)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade100),
                    ),
                    child: Text(
                      state.error!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                ),
              Expanded(
                child: RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () async {
                    final bloc = context.read<PatientAppointmentsBloc>();
                    bloc.add(const LoadPatientAppointmentsEvent());
                    await bloc.stream.firstWhere((s) => !s.loading);
                  },
                  child: CustomScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    slivers: [
                      if (state.currentItems.isEmpty)
                        const SliverFillRemaining(
                          child: Center(
                            child: Text(
                              'No appointments found.',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        )
                      else
                        SliverPadding(
                          padding:
                              const EdgeInsets.fromLTRB(16, 8, 16, 100),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final appointment =
                                    state.currentItems[index];
                                final canCancel = state.showUpcoming &&
                                    appointment.status == 'confirmed';
                                final cancelling = state.cancellingIds
                                    .contains(appointment.id);

                                return Padding(
                                  padding: EdgeInsets.only(
                                    bottom: index <
                                            state.currentItems.length - 1
                                        ? 12
                                        : 0,
                                  ),
                                  child: _AppointmentCard(
                                    appointment: appointment,
                                    canCancel: canCancel,
                                    cancelling: cancelling,
                                    onCancel: canCancel && !cancelling
                                        ? () {
                                            context
                                                .read<
                                                    PatientAppointmentsBloc>()
                                                .add(
                                                  CancelPatientAppointmentEvent(
                                                    appointmentId:
                                                        appointment.id,
                                                  ),
                                                );
                                          }
                                        : null,
                                  ),
                                );
                              },
                              childCount: state.currentItems.length,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _TabSwitcher extends StatelessWidget {
  final bool showUpcoming;
  final ValueChanged<bool> onChanged;

  const _TabSwitcher({required this.showUpcoming, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: _TabButton(
              active: showUpcoming,
              label: 'Upcoming',
              onTap: () => onChanged(true),
            ),
          ),
          Expanded(
            child: _TabButton(
              active: !showUpcoming,
              label: 'Past',
              onTap: () => onChanged(false),
            ),
          ),
        ],
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  final bool active;
  final String label;
  final VoidCallback onTap;

  const _TabButton({
    required this.active,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: active ? Colors.white : AppColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  final PatientAppointment appointment;
  final bool canCancel;
  final bool cancelling;
  final VoidCallback? onCancel;

  const _AppointmentCard({
    required this.appointment,
    required this.canCancel,
    required this.cancelling,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final dateText = DateFormat('EEEE, MMM d, yyyy').format(appointment.appointmentDate);
    final timeText = _toDisplayTime(appointment.startTime);
    final statusColor = appointment.status == 'confirmed'
        ? Colors.green
        : appointment.status == 'cancelled'
            ? Colors.red
            : AppColors.textSecondary;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: appointment.doctorImageUrl != null &&
                        appointment.doctorImageUrl!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: appointment.doctorImageUrl!,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => _avatarFallback(),
                      )
                    : _avatarFallback(),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      appointment.doctorName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      appointment.doctorSpecialty,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  appointment.status,
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _InfoRow(icon: Icons.calendar_today_outlined, text: dateText),
          const SizedBox(height: 6),
          _InfoRow(icon: Icons.access_time, text: timeText),
          const SizedBox(height: 6),
          _InfoRow(icon: Icons.location_on_outlined, text: appointment.locationLabel),
          if (canCancel) ...[
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: onCancel,
                child: cancelling
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text(
                        'Cancel',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
          ]
        ],
      ),
    );
  }

  Widget _avatarFallback() {
    return Container(
      width: 56,
      height: 56,
      color: Colors.grey.shade200,
      child: const Icon(Icons.person, color: Colors.grey),
    );
  }

  String _toDisplayTime(String rawTime) {
    try {
      final parsed = DateFormat('HH:mm:ss').parse(rawTime);
      return DateFormat('hh:mm a').format(parsed);
    } catch (_) {
      try {
        final parsed = DateFormat('HH:mm').parse(rawTime);
        return DateFormat('hh:mm a').format(parsed);
      } catch (_) {
        return rawTime;
      }
    }
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}
