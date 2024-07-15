/**
 * @brief Entry point of the program.
 * 
 * This function initializes two MassObject instances, `a` and `b`, with specific properties.
 * It then prints the state of all objects, runs one frame of the simulation, and prints the updated state of all objects.
 * 
 * @return int The exit status of the program.
 */
// N-body Simulation
#pragma once
#include "MassObject.hpp"
#include "utilities.hpp"

using namespace std;

//MassObject:: MassObject(double m, std::vector<double> pos, std::vector<double> vel, double time_int=0){
int main(){

    
    double time_interval;
    bool valid_input = false;
    
    while (!valid_input) {
        cout << "Enter the time interval(s): ";
        if (cin >> time_interval) {
            valid_input = true;
        } else {
            cout << "Invalid input. Please try again." << endl;
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }
    
    //

    MassObject a(10000,{1,0,0},{0,0,0}, time_interval);
    MassObject b(10000,{-1,0,0},{0,0,0});
    MassObject c(10000,{0,0,0},{0,0,0});
    
    print_object_state_all();
    //print object positions
    for(size_t n{0};n<100;++n){
        cout << "\nFrame: " << n << "\tTime: "<< n*MassObject::time_interval<< "s"<< endl;
        run_one_frame();
        //print object state
        print_object_state_all();
    }

    return 0;
}


