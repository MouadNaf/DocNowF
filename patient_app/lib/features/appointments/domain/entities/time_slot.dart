import 'package:equatable/equatable.dart';

class TimeSlot extends Equatable {
  final String time;
  final bool isAvailable;

  const TimeSlot({
    required this.time,
    required this.isAvailable,
  });

  @override
  List<Object?> get props => [time, isAvailable];
}
