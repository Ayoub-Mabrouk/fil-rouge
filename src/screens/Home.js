import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

import LottieView from "lottie-react-native";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { SIZES } from "../constants/theme";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { Button, Icon } from "react-native-elements";
import { PharmacyInfo } from "../components/modals/PharmacyInfo";
import { DistanceAndTime } from "../components/modals/DistanceAndTime";
import { env } from "../constants/env";
import tw from "twrnc";

const fetchData = async (location, setPharmacies) => {
  try {
    if (Object.keys(location).length !== 0) {
      const {
        coords: { latitude: lat, longitude: lon },
      } = location;
      const locationData = { lon, lat, distance: 15000 };
      const {
        data: { cities },
      } = await axios.post(
        "https://nearbypharmacyapi.herokuapp.com/google",
        locationData
      );
      setPharmacies(cities);
    }
  } catch (error) {
    // enter your logic for when there is an error (ex. error toast)
    console.log(`error: `, error);
  }
};

export default function Home() {
  //location state
  const [location, setLocation] = useState({});

  const [errorMsg, setErrorMsg] = useState(null);
  const [destination, setDestination] = useState(null);

  //pharamcies states
  const [Pharmacies, setPharmacies] = useState([]);
  const [InfoModalVisible, setInfoModalVisible] = useState(false);
  // const [DistanceModalVisible, setDistanceModalVisible] = useState(false);
  const [PharmacyInfos, SetPharmacyInfos] = useState({});
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      // get the user location
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          //60s*5=300s == 5m == 300000ms
          // timeInterval: 0,
          distanceInterval: 10,
        },
        (loc) => {
          setLocation(loc);
          fetchData(loc, setPharmacies);
        }
      );
      
    })();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {location?.coords && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
              ...location.coords,
            }}
          >
            {
              //show itineraire line
              destination && location?.coords && (
                <MapViewDirections
                  origin={location.coords}
                  destination={destination}
                  apikey={env.routesKey}
                  strokeWidth={5}
                  strokeColor="green"
                />
              )
            }

            {
              //all pharmacies
              Pharmacies?.map((e, i) => {
                const { lat: latitude, lng: longitude } = e.geometry.location;
                return (
                  <Marker
                    onPress={() => {
                      e.PhoneNumber=`+212${Math.floor(100000000 + Math.random() * 900000000)}`;

                      SetPharmacyInfos(e),
                        setInfoModalVisible(!InfoModalVisible);
                    }}
                    key={i}
                    coordinate={{ latitude, longitude }}
                  >
                    <Image
                      source={require("../../assets/png/pharmacyIcon.png")}
                      style={{ height: 45, width: 45 }}
                    />
                  </Marker>
                );
              })
            }
            {location?.coords && (
              <Marker
                tracksViewChanges={false}
                coordinate={location.coords}
                title={"me"}
              >
                <MaterialIcons
                  name="assistant-navigation"
                  size={40}
                  color="#e24d11"
                />
              </Marker>
            )}
          </MapView>
        )}

        <PharmacyInfo
          setDestination={setDestination}
          PharmacyInfos={PharmacyInfos}
          InfoModalVisible={InfoModalVisible}
          setInfoModalVisible={setInfoModalVisible}
        />
        {
          //show itineraire line
          destination && location?.coords && (
            <DistanceAndTime
              PharmacyInfos={PharmacyInfos}
              setDestination={setDestination}
              origin={location.coords}
              destination={destination}
            />
          )
        }
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: SIZES.width,
    height: SIZES.height,
  },
});
