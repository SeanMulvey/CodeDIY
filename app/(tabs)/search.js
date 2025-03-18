import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getVehicles } from '../../services/vehicleService';
import { searchRepairVideos, searchAndSaveRepairVideos } from '../../services/searchService';
import { addSearchToHistory } from '../../services/searchHistoryService';

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

export default function SearchScreen() {
  const [step, setStep] = useState(1); // Step 1: Vehicle selection, Step 2: Code input
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  
  // New vehicle fields
  const [newVehicle, setNewVehicle] = useState({
    year: YEARS[0],
    make: '',
    model: '',
  });
  
  // Code input
  const [code, setCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load saved vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehicles = await getVehicles();
        setSavedVehicles(vehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
    };

    loadVehicles();
  }, []);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleNewVehicleChange = (field, value) => {
    setNewVehicle(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateNewVehicle = () => {
    if (!newVehicle.make.trim()) {
      Alert.alert('Error', 'Please enter the vehicle make');
      return false;
    }
    
    if (!newVehicle.model.trim()) {
      Alert.alert('Error', 'Please enter the vehicle model');
      return false;
    }
    
    return true;
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!selectedVehicleId && !validateNewVehicle()) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      handleSearch();
    }
  };

  const handleGoBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSearch = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the diagnostic trouble code');
      return;
    }

    try {
      setLoading(true);

      // Determine which vehicle to use
      let vehicle;
      if (selectedVehicleId) {
        vehicle = savedVehicles.find(v => v.id === selectedVehicleId);
      } else {
        vehicle = newVehicle;
      }

      // Search and save to history
      const search = await searchAndSaveRepairVideos(vehicle, code);

      // Navigate to results
      router.push({
        pathname: `/search-results/${search.id}`,
      });
    } catch (error) {
      console.error('Error searching for videos:', error);
      Alert.alert('Error', 'Failed to search for videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{step === 1 ? 'Select Vehicle' : 'Enter Code'}</Text>
        <Text style={styles.subtitle}>
          {step === 1 
            ? 'Choose a saved vehicle or add a new one' 
            : 'Enter the diagnostic trouble code (DTC)'
          }
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.content}>
          {/* Saved Vehicles */}
          {savedVehicles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saved Vehicles</Text>
              <FlatList
                data={savedVehicles}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.vehicleItem,
                      selectedVehicleId === item.id && styles.selectedVehicle
                    ]}
                    onPress={() => handleVehicleSelect(item.id)}
                  >
                    <MaterialCommunityIcons 
                      name="car" 
                      size={24} 
                      color={selectedVehicleId === item.id ? '#fff' : '#3498db'} 
                    />
                    <Text 
                      style={[
                        styles.vehicleName, 
                        selectedVehicleId === item.id && styles.selectedText
                      ]}
                    >
                      {item.year} {item.make} {item.model}
                    </Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={true}
                style={styles.vehicleList}
                ListHeaderComponent={
                  <View style={styles.listHeader}>
                    <Text>Select a vehicle from your saved list:</Text>
                  </View>
                }
              />
            </View>
          )}

          {/* Add New Vehicle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {savedVehicles.length > 0 ? 'Or Add a New Vehicle' : 'Add a New Vehicle'}
            </Text>
            
            <Text style={styles.label}>Year</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newVehicle.year}
                onValueChange={(value) => handleNewVehicleChange('year', value)}
                style={styles.picker}
              >
                {YEARS.map(year => (
                  <Picker.Item key={year} label={year} value={year} />
                ))}
              </Picker>
            </View>
            
            <Text style={styles.label}>Make</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Honda"
              value={newVehicle.make}
              onChangeText={(text) => handleNewVehicleChange('make', text)}
            />
            
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Civic"
              value={newVehicle.model}
              onChangeText={(text) => handleNewVehicleChange('model', text)}
            />
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.selectedVehicleText}>
              Selected Vehicle: {selectedVehicleId 
                ? `${savedVehicles.find(v => v.id === selectedVehicleId).year} ${savedVehicles.find(v => v.id === selectedVehicleId).make} ${savedVehicles.find(v => v.id === selectedVehicleId).model}`
                : `${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`
              }
            </Text>
            
            <Text style={styles.label}>Diagnostic Trouble Code (DTC)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. P0300"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            
            <Text style={styles.helpText}>
              Enter the code from your OBD scanner or car's diagnostic system.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {step === 2 && (
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {step === 1 ? 'Continue' : 'Search'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  content: {
    padding: 15,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  listHeader: {
    marginBottom: 10,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedVehicle: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  vehicleName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
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
  selectedVehicleText: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
  helpText: {
    color: '#7f8c8d',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  backButton: {
    marginRight: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
  },
  vehicleList: {
    maxHeight: 200,
    minHeight: 50,
    flexGrow: 0,
  },
}); 