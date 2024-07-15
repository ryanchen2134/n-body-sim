#pragma once
#include <vector>

class MassObject{
    public:
        static constexpr double G = 6.67430e-11;
        static std::vector<MassObject> objects;
        static double time_interval; //default 0 
        static bool initialized; //default false

        double mass;
        std::vector<double> position;
        std::vector<double> pos_offset{0,0,0};
        std::vector<double> velocity;
        std::vector<double> vel_offset{0,0,0};

        MassObject(const double m, const std::vector<double> pos, const std::vector<double> vel, const double time_int=0);
        //utility functions are subject-object format
        void binary_accel_calc_RK4 (MassObject b);
        void binary_accel_calc_verlet(MassObject b);
        void binary_accel_calc_taylorbasic(MassObject b);
        void update();

};