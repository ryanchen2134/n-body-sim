#pragma once
#include <cmath>
#include "MassObject.hpp"
#include <iostream>

std::vector<double>& operator+=(std::vector<double>& a, const std::vector<double>& b);

std::vector<double> operator+(const std::vector<double>& a, const std::vector<double>& b);

std::vector<double> operator-(const std::vector<double>& a, const std::vector<double>& b);

std::vector<double> operator*(const std::vector<double>& vec, double scalar);

void run_one_frame();

std::vector<double> dir_distance(const std::vector<double>  a, const std::vector<double>  b);

double distance(const std::vector<double>  r);

double distance(const std::vector<double>  a, const std::vector<double>  b);

void print_object_state(MassObject a);

void print_object_state_all();