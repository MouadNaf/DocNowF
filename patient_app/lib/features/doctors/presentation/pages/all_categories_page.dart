import 'package:flutter/material.dart';
import '../../../../core/utils/colors.dart';
import 'all_doctors_page.dart';

class AllCategoriesPage extends StatelessWidget {
  const AllCategoriesPage({super.key});

  static const _categories = [
    {
      'label': 'Cardiology',
      'icon': Icons.favorite_rounded,
      'color': Color(0xFFFF6B6B),
    },
    {
      'label': 'Dentist',
      'icon': Icons.medical_services_outlined,
      'color': Color(0xFF5B9BD5),
    },
    {
      'label': 'Neurology',
      'icon': Icons.psychology_outlined,
      'color': Color(0xFFCC88E8),
    },
    {
      'label': 'Pediatrics',
      'icon': Icons.child_care_outlined,
      'color': Color(0xFFFFB347),
    },
    {
      'label': 'Orthopedics',
      'icon': Icons.accessible_forward,
      'color': Color(0xFF4ECDC4),
    },
    {
      'label': 'Ophthalmology',
      'icon': Icons.visibility_outlined,
      'color': Color(0xFFFF9F1C),
    },
    {
      'label': 'Dermatology',
      'icon': Icons.face_retouching_natural,
      'color': Color(0xFFF39C12),
    },
    {
      'label': 'General',
      'icon': Icons.local_hospital_outlined,
      'color': Color(0xFF2ECC71),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Medical Specialties',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: GridView.builder(
            physics: const BouncingScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 20,
              crossAxisSpacing: 16,
              childAspectRatio: 0.8,
            ),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final cat = _categories[index];
              final label = cat['label'] as String;
              final icon = cat['icon'] as IconData;
              final color = cat['color'] as Color;

              return GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AllDoctorsPage(initialCategory: label),
                    ),
                  );
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.transparent, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Center(child: Icon(icon, color: color, size: 26)),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          label,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
