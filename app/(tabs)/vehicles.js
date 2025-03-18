import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../services/vehicleService';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

// Generate years from 1990 to current year
const generateYearArray = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year.toString());
  }
  return years;
};

const YEARS = generateYearArray();

// Common car makes
const CAR_MAKES = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Buick", "Cadillac",
  "Chevrolet", "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "GMC", "Honda",
  "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus",
  "Lincoln", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MINI", "Mitsubishi",
  "Nissan", "Porsche", "Ram", "Rolls-Royce", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

// Models for each make (simplified - just a few models for common makes)
const CAR_MODELS = {
  "Acura": ["ILX", "MDX", "RDX", "TLX", "NSX"],
  "Audi": ["A3", "A4", "A6", "A8", "Q3", "Q5", "Q7", "Q8", "R8", "TT"],
  "BMW": ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "Z4"],
  "Chevrolet": ["Blazer", "Camaro", "Colorado", "Corvette", "Equinox", "Malibu", "Silverado", "Suburban", "Tahoe", "Traverse"],
  "Dodge": ["Challenger", "Charger", "Durango", "Grand Caravan", "Journey"],
  "Ford": ["Bronco", "Edge", "Escape", "Explorer", "F-150", "Fusion", "Mustang", "Ranger"],
  "Honda": ["Accord", "Civic", "CR-V", "Fit", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  "Hyundai": ["Accent", "Elantra", "Kona", "Palisade", "Santa Fe", "Sonata", "Tucson", "Veloster"],
  "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wrangler"],
  "Kia": ["Forte", "K5", "Optima", "Rio", "Sedona", "Seltos", "Sorento", "Soul", "Sportage", "Telluride"],
  "Lexus": ["ES", "GS", "IS", "LC", "LS", "NX", "RX", "UX"],
  "Mazda": ["CX-3", "CX-5", "CX-9", "Mazda3", "Mazda6", "MX-5 Miata"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "G-Class", "GLA", "GLC", "GLE", "S-Class"],
  "Nissan": ["Altima", "Armada", "Frontier", "Kicks", "Leaf", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan", "Versa"],
  "Subaru": ["Ascent", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "WRX"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
  "Toyota": ["4Runner", "Avalon", "Camry", "Corolla", "Highlander", "Prius", "RAV4", "Sienna", "Tacoma", "Tundra"]
};

// Default models for "Other" make
const DEFAULT_MODELS = ["Other"];

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    year: YEARS[0],
    make: CAR_MAKES[0],
    model: CAR_MODELS[CAR_MAKES[0]][0],
  });
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [showCustomMake, setShowCustomMake] = useState(false);
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [availableModels, setAvailableModels] = useState(CAR_MODELS[CAR_MAKES[0]] || DEFAULT_MODELS);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    // Update available models when make changes
    if (formData.make === "Other") {
      setShowCustomMake(true);
      setShowCustomModel(true);
      setAvailableModels(DEFAULT_MODELS);
    } else {
      setShowCustomMake(false);
      const models = CAR_MODELS[formData.make] || DEFAULT_MODELS;
      setAvailableModels(models);
      
      if (models.includes(formData.model)) {
        setShowCustomModel(false);
      } else {
        // If current model isn't in the list for the new make
        setFormData({
          ...formData,
          model: models[0] || "Other"
        });
        setShowCustomModel(formData.model === "Other");
      }
    }
  }, [formData.make]);

  useEffect(() => {
    // Handle when model is "Other"
    setShowCustomModel(formData.model === "Other");
  }, [formData.model]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const userVehicles = await getVehicles();
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setFormData({
      year: YEARS[0],
      make: CAR_MAKES[0],
      model: CAR_MODELS[CAR_MAKES[0]][0],
    });
    setCustomMake("");
    setCustomModel("");
    setShowCustomMake(false);
    setShowCustomModel(false);
    setModalVisible(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    
    // Handle custom make/model for existing vehicles
    if (CAR_MAKES.includes(vehicle.make)) {
      setShowCustomMake(false);
      setFormData({
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
      });
      
      // Check if the model exists for this make
      if (CAR_MODELS[vehicle.make]?.includes(vehicle.model)) {
        setShowCustomModel(false);
      } else {
        setFormData({
          year: vehicle.year,
          make: vehicle.make,
          model: "Other",
        });
        setCustomModel(vehicle.model);
        setShowCustomModel(true);
      }
    } else {
      // Custom make
      setFormData({
        year: vehicle.year,
        make: "Other",
        model: "Other",
      });
      setCustomMake(vehicle.make);
      setCustomModel(vehicle.model);
      setShowCustomMake(true);
      setShowCustomModel(true);
    }
    
    setModalVisible(true);
  };

  const handleDeleteVehicle = async (vehicle) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Attempting to delete vehicle:', vehicle.id);
              
              // Add a deep copy of the vehicle to ensure it matches exactly what's in Firestore
              const vehicleCopy = JSON.parse(JSON.stringify(vehicle));
              
              const result = await deleteVehicle(vehicleCopy);
              console.log('Delete vehicle result:', result);
              
              // Force reload vehicles from server to confirm deletion
              const updatedVehicles = await getVehicles();
              setVehicles(updatedVehicles);
              
              Alert.alert('Success', 'Vehicle deleted successfully');
            } catch (error) {
              console.error('Error deleting vehicle:', error);
              Alert.alert('Error', 'Failed to delete vehicle: ' + error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    if (formData.make === "Other" && !customMake.trim()) {
      Alert.alert('Error', 'Please enter the vehicle make');
      return false;
    }

    if (formData.model === "Other" && !customModel.trim()) {
      Alert.alert('Error', 'Please enter the vehicle model');
      return false;
    }

    return true;
  };

  const handleSaveVehicle = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare vehicle data with custom fields if needed
      const vehicleData = {
        ...formData,
        make: formData.make === "Other" ? customMake : formData.make,
        model: formData.model === "Other" ? customModel : formData.model,
      };

      if (editingVehicle) {
        // Update existing vehicle
        const updatedVehicle = {
          ...editingVehicle,
          ...vehicleData,
        };
        await updateVehicle(updatedVehicle);
        setVehicles(vehicles.map(v => (v.id === updatedVehicle.id ? updatedVehicle : v)));
        Alert.alert('Success', 'Vehicle updated successfully');
      } else {
        // Add new vehicle
        const newVehicle = await addVehicle(vehicleData);
        setVehicles([...vehicles, newVehicle]);
        Alert.alert('Success', 'Vehicle added successfully');
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      Alert.alert('Error', 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const renderVehicleItem = ({ item }) => (
    <View style={styles.vehicleItem}>
      <View style={styles.vehicleInfo}>
        <MaterialCommunityIcons name="car" size={24} color="#3498db" />
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleName}>
            {item.year} {item.make} {item.model}
          </Text>
          <Text style={styles.vehicleDate}>
            Added on {new Date(item.addedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.vehicleActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditVehicle(item)}
        >
          <AntDesign name="edit" size={18} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteVehicle(item)}
        >
          <AntDesign name="delete" size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add a function to clear all vehicles
  const handleClearAllVehicles = () => {
    if (vehicles.length === 0) {
      Alert.alert('No Vehicles', 'You have no vehicles to clear.');
      return;
    }

    Alert.alert(
      'Clear All Vehicles',
      'Are you sure you want to remove all your vehicles?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const user = auth.currentUser;
              if (!user) throw new Error('User not authenticated');
              
              // Direct reference to user document
              const userDocRef = doc(db, 'users', user.uid);
              
              // Update with empty vehicles array
              await updateDoc(userDocRef, {
                vehicles: []
              });
              
              // Clear local state
              setVehicles([]);
              Alert.alert('Success', 'All vehicles removed');
              
            } catch (error) {
              console.error('Error clearing vehicles:', error);
              Alert.alert('Error', 'Failed to clear vehicles: ' + error.message);
              
              // Reload to ensure UI is in sync
              await loadVehicles();
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Vehicles</Text>
        <Text style={styles.subtitle}>Manage your vehicles for quick searches</Text>
      </View>

      {loading && vehicles.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderVehicleItem}
          contentContainerStyle={styles.list}
          style={styles.flatList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="car-off"
                size={60}
                color="#bdc3c7"
              />
              <Text style={styles.emptyText}>
                You haven't added any vehicles yet
              </Text>
              <Text style={styles.emptySubtext}>
                Add a vehicle to get started with quick searches
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddVehicle}
        disabled={loading}
      >
        <AntDesign name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {vehicles.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearAllVehicles}
        >
          <AntDesign name="delete" size={18} color="#fff" />
          <Text style={styles.clearButtonText}>Clear All Vehicles</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={20} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Year</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.year}
                onValueChange={(value) => handleFormChange('year', value)}
                style={styles.picker}
              >
                {YEARS.map((year) => (
                  <Picker.Item key={year} label={year} value={year} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Make</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.make}
                onValueChange={(value) => handleFormChange('make', value)}
                style={styles.picker}
              >
                {CAR_MAKES.map((make) => (
                  <Picker.Item key={make} label={make} value={make} />
                ))}
                <Picker.Item key="other-make" label="Other" value="Other" />
              </Picker>
            </View>

            {showCustomMake && (
              <TextInput
                style={styles.input}
                placeholder="Enter custom make"
                value={customMake}
                onChangeText={setCustomMake}
              />
            )}

            <Text style={styles.label}>Model</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.model}
                onValueChange={(value) => handleFormChange('model', value)}
                style={styles.picker}
                enabled={!showCustomMake}
              >
                {availableModels.map((model) => (
                  <Picker.Item key={model} label={model} value={model} />
                ))}
                <Picker.Item key="other-model" label="Other" value="Other" />
              </Picker>
            </View>

            {showCustomModel && (
              <TextInput
                style={styles.input}
                placeholder="Enter custom model"
                value={customModel}
                onChangeText={setCustomModel}
              />
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveVehicle}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  list: {
    padding: 15,
  },
  vehicleItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleDetails: {
    marginLeft: 10,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  vehicleDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 3,
  },
  vehicleActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatList: {
    flex: 1,
    width: '100%',
  },
  clearButton: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#e74c3c',
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 