import 'package:flutter/material.dart';
import 'package:patient_app/core/utils/navigation_service.dart';
import 'package:patient_app/features/auth/presentation/pages/profile_page.dart';
import 'home_page.dart';
import '../../../auth/presentation/pages/profile_page.dart';
import '../../../../core/widgets/bottom_navigation_bar.dart';

class MainDashboard extends StatefulWidget {
  const MainDashboard({super.key});

  @override
  State<MainDashboard> createState() => _MainDashboardState();
}

class _MainDashboardState extends State<MainDashboard> {
  final List<Widget> _pages = [
    const HomePage(),
    const PlaceholderPage(title: 'Appointments'),
    const PlaceholderPage(title: 'Favorites'),
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

class PlaceholderPage extends StatelessWidget {
  final String title;
  const PlaceholderPage({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('Welcome to $title Page')),
    );
  }
}
