import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import axiosInstance from "@/config";
import { GoodsPost } from "@/types";
import { useRouter } from "expo-router";
import { Plus, Search, Filter, Calendar, X, Weight, User } from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Category } from '@/types/Category';
import { TabBar } from "@/components/navigation/TabBar";
import { TopNavigation } from "@/components/navigation/TopNavigation";

const { width } = Dimensions.get("window");

export default function GoodPostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [goodsPosts, setGoodsPosts] = useState<GoodsPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<GoodsPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateFilterType, setDateFilterType] = useState<'any' | 'departure' | 'arrival'>('any');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState("travel");
  
  // New filter states
  const [minKg, setMinKg] = useState("");
  const [maxKg, setMaxKg] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    fetchGoodsPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    searchQuery, 
    selectedCategory, 
    selectedDate, 
    goodsPosts, 
    minKg, 
    maxKg, 
    selectedGender
  ]);

  const fetchGoodsPosts = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/goods-posts");
      
      // Log the entire first post to see its structure
      if (response.data.data && response.data.data.length > 0) {
        console.log("First post data:", JSON.stringify(response.data.data[0], null, 2));
      }
      
      // Process the data to ensure traveler info is properly structured
      const processedPosts = (response.data.data || []).map((post: any) => {
        console.log("Processing post:", post.id, "Traveler:", post.traveler);
        
        // Ensure traveler object has the expected structure
        if (post.traveler) {
          // Make sure firstName and lastName are accessible
          const traveler = {
            ...post.traveler,
            firstName: post.traveler.firstName || '',
            lastName: post.traveler.lastName || '',
            gender: post.traveler.gender || 'UNKNOWN'
          };
          
          return { ...post, traveler };
        }
        return post;
      });
      
      setGoodsPosts(processedPosts);
      setFilteredPosts(processedPosts);
    } catch (error) {
      console.error("Error fetching goods posts:", error);
      setGoodsPosts([]);
      setFilteredPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...goodsPosts];

    // Filter by search query (title or content or traveler name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        post => {
          // Debug log to see what we're working with
          if (post.traveler) {
            console.log("Filtering traveler:", 
              post.traveler.firstName, 
              post.traveler.lastName,
              "Query:", query);
          }
          
          return post.title?.toLowerCase().includes(query) || 
            post.content?.toLowerCase().includes(query) ||
            post.originLocation?.toLowerCase().includes(query) ||
            post.airportLocation?.toLowerCase().includes(query) ||
            (post.traveler?.firstName?.toLowerCase().includes(query) || 
             post.traveler?.lastName?.toLowerCase().includes(query));
        }
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category?.id.toString() === selectedCategory);
    }

    // Filter by date
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(post => {
        // Filter based on dateFilterType
        if (dateFilterType === 'departure') {
          if (!post.departureDate) return false;
          const depDate = new Date(post.departureDate).toISOString().split('T')[0];
          return depDate === dateString;
        } 
        else if (dateFilterType === 'arrival') {
          if (!post.arrivalDate) return false;
          const arrDate = new Date(post.arrivalDate).toISOString().split('T')[0];
          return arrDate === dateString;
        }
        else { // 'any'
          // Try to match either departure or arrival date
          if (!post.departureDate && !post.arrivalDate) return false;
          
          let matches = false;
          if (post.departureDate) {
            const depDate = new Date(post.departureDate).toISOString().split('T')[0];
            if (depDate === dateString) matches = true;
          }
          
          if (post.arrivalDate && !matches) {
            const arrDate = new Date(post.arrivalDate).toISOString().split('T')[0];
            if (arrDate === dateString) matches = true;
          }
          
          return matches;
        }
      });
    }
    
    // Filter by available kg
    if (minKg) {
      const min = parseFloat(minKg);
      filtered = filtered.filter(post => {
        const kg = typeof post.availableKg === 'number' 
          ? post.availableKg 
          : parseFloat(String(post.availableKg || "0"));
        return !isNaN(kg) && kg >= min;
      });
    }
    
    if (maxKg) {
      const max = parseFloat(maxKg);
      filtered = filtered.filter(post => {
        const kg = typeof post.availableKg === 'number' 
          ? post.availableKg 
          : parseFloat(String(post.availableKg || "0"));
        return !isNaN(kg) && kg <= max;
      });
    }
    
    // Filter by traveler gender
    if (selectedGender) {
      filtered = filtered.filter(post => 
        post.traveler?.gender === selectedGender
      );
    }

    setFilteredPosts(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDate(null);
    setDateFilterType('any');
    setMinKg("");
    setMaxKg("");
    setSelectedGender("");
    setFilteredPosts(goodsPosts);
    setShowFilterModal(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || '?';
  };

  const handleCreatePost = () => {
    router.push("/goodPost/createGoodsPost");
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === "create") {
      router.push("/verification/CreateSponsorPost");
    } else if (tab === "travel") {
      // Already on travel tab, no need to navigate
      return;
    } else if (tab === "sponsor") {
      router.push("/verification/fetchAll");
    } else if (tab === "home") {
      router.push("/home");
    } else {
      // Handle other tabs if needed in the future
      console.log(`Tab ${tab} not implemented yet`);
    }
  };

  const renderGoodsPostItem = ({ item }: { item: any }) => {
    console.log("Rendering item:", item.id);
    console.log("Traveler data:", item.traveler);
    
    // Extract firstName and lastName safely with more detailed logging
    const firstName = item.traveler?.firstName || '';
    const lastName = item.traveler?.lastName || '';
    console.log(`Name parts: "${firstName}" "${lastName}"`);
    
    const travelerName = `${firstName} ${lastName}`.trim();
    console.log(`Final traveler name: "${travelerName}"`);
    
    const displayName = travelerName || 'Unknown Traveler';
    
    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Top perforated edge */}
          <View style={styles.perforatedEdge}>
            {Array.from({ length: 15 }).map((_, i) => (
              <View key={i} style={styles.perforation} />
            ))}
          </View>
          
          {/* Ticket header with date info - SMALLER */}
          <View style={styles.ticketHeader}>
            <View style={styles.dateInfo}>
              <ThemedText style={styles.dateLabel}>DEPARTURE</ThemedText>
              <ThemedText style={styles.dateValue}>
                {item.departureDate ? new Date(item.departureDate).toLocaleDateString() : 'TBD'}
              </ThemedText>
            </View>
            <View style={styles.dateInfo}>
              <ThemedText style={styles.dateLabel}>ARRIVAL</ThemedText>
              <ThemedText style={styles.dateValue}>
                {item.arrivalDate ? new Date(item.arrivalDate).toLocaleDateString() : 'TBD'}
              </ThemedText>
            </View>
          </View>
          
          {/* Traveler information */}
          <View style={styles.travelerSection}>
            {item.traveler?.imageUrl ? (
              <Image
                source={{ uri: item.traveler.imageUrl }}
                style={styles.travelerImage}
              />
            ) : (
              <View style={styles.initialsContainer}>
                <Text style={styles.initialsText}>{getInitials(firstName, lastName)}</Text>
              </View>
            )}
            <View style={styles.travelerInfo}>
              <ThemedText style={styles.passengerLabel}>PASSENGER</ThemedText>
              <ThemedText style={styles.travelerName}>{displayName}</ThemedText>
              <ThemedText style={styles.travelerGender}>
                {item.traveler?.gender || 'Not specified'}
              </ThemedText>
            </View>
          </View>
          
          {/* Title and description section */}
          <View style={styles.contentSection}>
            <ThemedText style={styles.titleText}>{item.title || 'Untitled'}</ThemedText>
            <ThemedText style={styles.descriptionText}>
              {item.content || 'No description available'}
            </ThemedText>
          </View>
          
          {/* Journey visualization */}
          <View style={styles.journeySection}>
            <View style={styles.journeyPoint}>
              <ThemedText style={styles.journeyCity}>ORIGIN</ThemedText>
              <ThemedText style={styles.journeyAirport}>{item.originLocation || '---'}</ThemedText>
            </View>
            
            <View style={styles.journeyLine}>
              <View style={styles.journeyDashedLine} />
              <Text style={styles.journeyIcon}>✈️</Text>
            </View>
            
            <View style={styles.journeyPoint}>
              <ThemedText style={styles.journeyCity}>DESTINATION</ThemedText>
              <ThemedText style={styles.journeyAirport}>{item.airportLocation || 'TBD'}</ThemedText>
            </View>
          </View>
          
          {/* Perforated divider */}
          <View style={styles.perforatedDivider}>
            {Array.from({ length: 15 }).map((_, i) => (
              <View key={i} style={styles.perforation} />
            ))}
          </View>
          
          {/* Ticket details */}
          <View style={styles.ticketDetails}>
            <View style={styles.detailColumn}>
              <ThemedText style={styles.detailLabel}>CATEGORY</ThemedText>
              <ThemedText style={styles.detailValue}>{item.category?.name || 'Uncategorized'}</ThemedText>
            </View>
            
            <View style={styles.detailColumn}>
              <ThemedText style={styles.detailLabel}>AVAILABLE KG</ThemedText>
              <ThemedText style={styles.detailValue}>{item.availableKg || 'N/A'} KG</ThemedText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <TopNavigation title="Travel Posts" />
        
        {/* Search and filter bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title, content or traveler"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Active filters display */}
        {(selectedCategory || selectedDate || minKg || maxKg || selectedGender) && (
          <View style={styles.activeFiltersContainer}>
            <ThemedText style={styles.activeFiltersTitle}>Active filters:</ThemedText>
            <View style={styles.activeFiltersRow}>
              {selectedCategory && (
                <View style={styles.activeFilterTag}>
                  <ThemedText style={styles.activeFilterText}>
                    {categories.find(c => c.id.toString() === selectedCategory)?.name || 'Category'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setSelectedCategory("")}>
                    <X size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedDate && (
                <View style={styles.activeFilterTag}>
                  <ThemedText style={styles.activeFilterText}>
                    {dateFilterType !== 'any' ? 
                      `${dateFilterType === 'departure' ? 'Dep' : 'Arr'} ` : ''}
                    {selectedDate.toLocaleDateString()}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setSelectedDate(null)}>
                    <X size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
              {(minKg || maxKg) && (
                <View style={styles.activeFilterTag}>
                  <ThemedText style={styles.activeFilterText}>
                    {minKg && maxKg ? `${minKg}-${maxKg} kg` : 
                     minKg ? `Min ${minKg} kg` : `Max ${maxKg} kg`}
                  </ThemedText>
                  <TouchableOpacity onPress={() => { setMinKg(""); setMaxKg(""); }}>
                    <X size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedGender && (
                <View style={styles.activeFilterTag}>
                  <ThemedText style={styles.activeFilterText}>
                    {selectedGender}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setSelectedGender("")}>
                    <X size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={resetFilters} style={styles.resetFiltersButton}>
                <ThemedText style={styles.resetFiltersText}>Reset all</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredPosts}
            renderItem={renderGoodsPostItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {searchQuery || selectedCategory || selectedDate || minKg || maxKg || selectedGender
                    ? "No posts match your search criteria" 
                    : "No goods posts available"}
                </ThemedText>
              </View>
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
        
        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Filter Posts</ThemedText>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={true}>
                <View style={styles.filterSection}>
                  <ThemedText style={styles.filterLabel}>Category</ThemedText>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedCategory}
                      onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="All Categories" value="" />
                      {categories.map((category) => (
                        <Picker.Item
                          key={category.id}
                          label={category.name}
                          value={category.id.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
                
                <View style={styles.filterSection}>
                  <ThemedText style={styles.filterLabel}>Date Type</ThemedText>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={dateFilterType}
                      onValueChange={(itemValue) => setDateFilterType(itemValue as 'any' | 'departure' | 'arrival')}
                      style={styles.picker}
                    >
                      <Picker.Item label="Any Date Type" value="any" />
                      <Picker.Item label="Departure Date" value="departure" />
                      <Picker.Item label="Arrival Date" value="arrival" />
                    </Picker>
                  </View>
                </View>
                
                <View style={styles.filterSection}>
                  <ThemedText style={styles.filterLabel}>Select Date</ThemedText>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar size={20} color="#3a86ff" style={{marginRight: 10}} />
                    <ThemedText style={styles.dateText}>
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
                    </ThemedText>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                </View>
                
                {/* Weight Range Filter */}
                <View style={styles.filterSection}>
                  <ThemedText style={styles.filterLabel}>Available Weight (kg)</ThemedText>
                  <View style={styles.weightRangeContainer}>
                    <View style={styles.weightInputContainer}>
                      <Weight size={18} color="#3a86ff" />
                      <TextInput
                        style={styles.weightInput}
                        placeholder="Min"
                        value={minKg}
                        onChangeText={setMinKg}
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <ThemedText style={styles.weightRangeSeparator}>to</ThemedText>
                    <View style={styles.weightInputContainer}>
                      <Weight size={18} color="#3a86ff" />
                      <TextInput
                        style={styles.weightInput}
                        placeholder="Max"
                        value={maxKg}
                        onChangeText={setMaxKg}
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                </View>
                
                {/* Gender Filter */}
                <View style={styles.filterSection}>
                  <ThemedText style={styles.filterLabel}>Traveler Gender</ThemedText>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedGender}
                      onValueChange={(itemValue) => setSelectedGender(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Any Gender" value="" />
                      <Picker.Item label="Male" value="MALE" />
                      <Picker.Item label="Female" value="FEMALE" />
                    </Picker>
                  </View>
                </View>
                
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.resetButton]}
                    onPress={resetFilters}
                  >
                    <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.applyButton]}
                    onPress={() => {
                      applyFilters();
                      setShowFilterModal(false);
                    }}
                  >
                    <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
        
        {/* Floating Action Button with Lucide icon */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleCreatePost}
          activeOpacity={0.8}
        >
          <Plus size={24} color="white" strokeWidth={2.5} />
        </TouchableOpacity>

        <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#3a86ff',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFiltersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activeFiltersTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  activeFilterText: {
    fontSize: 12,
    marginRight: 6,
  },
  resetFiltersButton: {
    marginLeft: 4,
  },
  resetFiltersText: {
    fontSize: 12,
    color: '#3a86ff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Add padding to account for TabBar
  },
  cardContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  card: {
    width: width * 0.9,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  perforatedEdge: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 10,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  perforation: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f0f4f8",
    marginTop: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    paddingBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  dateInfo: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 9,
    color: "#999",
    fontWeight: "bold",
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  travelerSection: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  travelerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#3a86ff",
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3a86ff",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  travelerInfo: {
    marginLeft: 16,
    justifyContent: "center",
  },
  passengerLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "bold",
    marginBottom: 4,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  travelerGender: {
    fontSize: 14,
    color: "#666",
  },
  contentSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3a86ff",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  journeySection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  journeyPoint: {
    alignItems: "center",
    width: 100,
  },
  journeyCity: {
    fontSize: 10,
    color: "#999",
    fontWeight: "bold",
    marginBottom: 4,
  },
  journeyAirport: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  journeyLine: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  journeyDashedLine: {
    height: 2,
    width: "100%",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#3a86ff",
    borderRadius: 1,
  },
  journeyIcon: {
    position: "absolute",
    fontSize: 16,
  },
  perforatedDivider: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  ticketDetails: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 95, // Adjust to be above TabBar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3a86ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  modalScrollContent: {
    paddingBottom: 30,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#3a86ff',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // New styles for weight range filter
  weightRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weightInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
  },
  weightInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  weightRangeSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#666",
  },
});
