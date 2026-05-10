import 'package:flutter/material.dart';
import 'package:patient_app/core/utils/navigation_service.dart';
import 'package:patient_app/features/auth/presentation/pages/profile_page.dart';
import 'package:patient_app/features/appointments/presentation/pages/appointments_page.dart';
import 'package:patient_app/features/chatbot/presentation/pages/chatbot_page.dart';
import 'package:patient_app/features/doctors/presentation/pages/favorite_doctors_page.dart';
import 'home_page.dart';
import '../../../../core/widgets/bottom_navigation_bar.dart';
import '../../../../core/utils/colors.dart';

class MainDashboard extends StatefulWidget {
  const MainDashboard({super.key});

  @override
  State<MainDashboard> createState() => _MainDashboardState();
}

class _MainDashboardState extends State<MainDashboard> {
  final List<Widget> _pages = [
    const HomePage(),
    const AppointmentsPage(),
    const FavoriteDoctorsPage(),
    const ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: NavigationService.currentIndex,
      builder: (context, index, child) {
        return Scaffold(
          body: IndexedStack(
            index: index,
            children: _pages,
          ),
          floatingActionButton: FloatingActionButton(
            backgroundColor: AppColors.primary,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ChatbotPage()),
              );
            },
            child: const Icon(Icons.chat_bubble_outline, color: Colors.white),
          ),
          floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
          bottomNavigationBar: CustomBottomNavigationBar(
            currentIndex: index,
            onTap: (newIndex) {
              NavigationService.currentIndex.value = newIndex;
            },
          ),
        );
      },
    );
  }
}
