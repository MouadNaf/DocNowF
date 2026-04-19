import 'package:flutter/material.dart';

class NavigationService {
  static final ValueNotifier<int> currentIndex = ValueNotifier<int>(0);

  static void changeTab(int index, BuildContext context) {
    currentIndex.value = index;
    // Pop to root to show the dashboard tabs
    Navigator.of(context).popUntil((route) => route.isFirst);
  }
}
