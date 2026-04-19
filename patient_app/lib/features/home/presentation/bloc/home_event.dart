import 'package:equatable/equatable.dart';

abstract class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

class LoadHomeData extends HomeEvent {
  const LoadHomeData();
}

class CategorySelected extends HomeEvent {
  final String category;
  const CategorySelected(this.category);

  @override
  List<Object?> get props => [category];
}
