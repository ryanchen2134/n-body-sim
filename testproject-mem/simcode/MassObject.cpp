
#include "MassObject.hpp"
#include <stdexcept>
#include "utilities.hpp"

// Class definition for MassObject

// Static member variable initialization
double MassObject::time_interval = 0.0;
bool MassObject::initialized = false;
std::vector<MassObject> MassObject::objects{};

void MassObject::update() {
    this->position += this->pos_offset;
    this->velocity += this->vel_offset;
    this->pos_offset = {0, 0, 0};
    this->vel_offset = {0, 0, 0};
}

// Constructor for MassObject
// Parameters:
// - m: mass of the object (default: 0)
// - pos: position vector of the object (default: {0, 0, 0})
// - vel: velocity vector of the object (default: {0, 0, 0})
// - time_int: time interval (default: 0)
MassObject::MassObject(const double m, const std::vector<double> pos, const std::vector<double> vel, const double time_int) {
    if (!this->initialized) {
        MassObject::time_interval = time_int;
        std::cout<<"Time interval set to: "<<MassObject::time_interval<<std::endl;
        initialized = true;
    } 
    this->mass = m;
    this->position = pos;
    this->velocity = vel;
    MassObject::objects.push_back(*this);
}

// Function to calculate acceleration between two MassObjects using the Runge-Kutta 4th order method
// Parameters:
// - b: the other MassObject
void MassObject::binary_accel_calc_RK4(MassObject b) {
    // RK4 Implementation
}

// Function to calculate acceleration between two MassObjects using the Verlet method
// Parameters:
// - b: the other MassObject
void MassObject::binary_accel_calc_verlet(MassObject b) {
    std::vector<double> acceleration{0, 0, 0}, pos_offset_verlet{0, 0, 0};
    // pos_offset_verlet will be used for the predictor-corrector velocity update
    // as per the Verlet method

    for (size_t x{0}; x < MassObject::objects.size(); ++x) {
        if (&MassObject::objects[x] == this) {
            continue;
        } // skipping self interaction
        std::vector<double> r{dir_distance(this->position, MassObject::objects[x].position)};

        acceleration = r * (G * b.mass / pow((distance(r)), 3)); // brackets are needed for only 1 type of operator overload is specified
        pos_offset_verlet = (this->velocity * time_interval) + (acceleration * (0.5 * time_interval * time_interval)); // vt + 1/2 * at^2
        this->pos_offset += pos_offset_verlet; // adding current binary offset to total offset
        //debug
        // std::cout<<"Delta S: "<<this->pos_offset[0]<<", "<<this->pos_offset[1]<<", "<<this->pos_offset[2]<<std::endl;
        std::vector<double> pos_predictor = this->position + pos_offset_verlet; // using binary offset for P-C velocity calc.
        this->vel_offset += (acceleration + ((r - pos_offset_verlet) * (G * b.mass / pow(distance(r - pos_offset_verlet), 3)))) * 0.5 * time_interval;
        //debug
        // std::cout<<"Delta V: "<<this->vel_offset[0]<<", "<<this->vel_offset[1]<<", "<<this->vel_offset[2]<<std::endl;
    }
}

// Function to calculate acceleration between two MassObjects using the basic Taylor method
// Parameters:
// - b: the other MassObject
void MassObject::binary_accel_calc_taylorbasic(MassObject b) {
    // Implementation of the basic Taylor method
}