#include "utilities.hpp"

/**
 * @brief Overloads the += operator for vectors.
 * 
 * @param a The first vector.
 * @param b The second vector.
 * @return The result of adding b to a.
 * @throws std::invalid_argument if the vectors are not of the same size.
 */
std::vector<double>& operator+=(std::vector<double>& a, const std::vector<double>& b) {
    if (a.size() != b.size()) {
        throw std::invalid_argument("Vectors must be of the same size.");
    }

    for (size_t i = 0; i < a.size(); ++i) {
        a[i] += b[i];
    }
    return a;
}

/**
 * @brief Overloads the + operator for vectors.
 * 
 * @param a The first vector.
 * @param b The second vector.
 * @return The result of adding a and b.
 * @throws std::invalid_argument if the vectors are not of the same size.
 */
std::vector<double> operator+(const std::vector<double>& a, const std::vector<double>& b) {
    if (a.size() != b.size()) {
        throw std::invalid_argument("Vectors must be of the same size.");
    }

    std::vector<double> result(a.size());
    for (size_t i = 0; i < a.size(); ++i) {
        result[i] = a[i] + b[i];
    }
    return result;
}

/**
 * @brief Overloads the - operator for vectors.
 * 
 * @param a The first vector.
 * @param b The second vector.
 * @return The result of subtracting b from a.
 * @throws std::invalid_argument if the vectors are not of the same size.
 */
std::vector<double> operator-(const std::vector<double>& a, const std::vector<double>& b) {
    if (a.size() != b.size()) {
        throw std::invalid_argument("Vectors must be of the same size.");
    }

    std::vector<double> result(a.size());
    for (size_t i = 0; i < a.size(); ++i) {
        result[i] = a[i] - b[i];
    }
    return result;
}

/**
 * @brief Overloads the * operator for vector and scalar multiplication.
 * 
 * @param vec The vector.
 * @param scalar The scalar.
 * @return The result of multiplying vec by scalar.
 */
std::vector<double> operator*(const std::vector<double>& vec, double scalar) {
    std::vector<double> result(vec.size());
    for (size_t i = 0; i < vec.size(); ++i) {
        result[i] = vec[i] * scalar;
    }
    return result;
}
/**
 * @file utilities.cpp
 * @brief Implementation of utility functions for the simulation.
 */


/**
 * @brief Runs one frame of the simulation.
 * 
 * This function calculates the binary acceleration using the Verlet algorithm for each pair of mass objects.
 */
void run_one_frame(){
    for(MassObject& object_a : MassObject::objects){
        for(MassObject& object_b : MassObject::objects){
            if (&object_a == &object_b){
                continue;
            }
            object_a.binary_accel_calc_verlet(object_b);
        }
    }
    for(MassObject& object : MassObject::objects){
        object.update();
    }
}

/**
 * @brief Calculates the vector difference between two vectors.
 * 
 * @param a The first vector.
 * @param b The second vector.
 * @return The vector difference between a and b.
 */
std::vector<double> dir_distance(const std::vector<double>  a, const std::vector<double>  b){
    return b - a;
}

/**
 * @brief Calculates the Euclidean distance of a vector from the origin.
 * 
 * @param r The vector.
 * @return The Euclidean distance of r from the origin.
 */
double distance(const std::vector<double>  r){
    return  sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]);
}

/**
 * @brief Calculates the Euclidean distance between two vectors.
 * 
 * @param a The first vector.
 * @param b The second vector.
 * @return The Euclidean distance between a and b.
 */
double distance(const std::vector<double>  a, const std::vector<double>  b){
    return  sqrt(
       (b[0]-a[0])*(b[0]-a[0])
      +(b[1]-a[1])*(b[1]-a[1])
      +(b[2]-a[2])*(b[2]-a[2])
      );
}

/**
 * @brief Prints the state of a mass object.
 * 
 * @param a The mass object.
 */
void print_object_state(MassObject a){
    std::cout<<"Position: ";
    for(auto i: a.position){
        std::cout<<i<<" ";
    }
    std::cout<<"\t";

    std::cout<<"Velocity: ";
    for(auto i: a.velocity){
        std::cout<<i<<" ";
    }
    std::cout<<std::endl;
}

/**
 * @brief Prints the state of all mass objects.
 */
void print_object_state_all(){
    size_t n{1};
    for(auto i: MassObject::objects){
        std::cout << "Object " << n << ": ";
        print_object_state(i);
        ++n;
    }
}
