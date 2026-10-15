package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Location;
import com.campuscircular.backend.repository.LocationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {

    private final LocationRepository locationRepository;

    public LocationController(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @GetMapping
    public List<Location> getLocations() {
        if (locationRepository.count() == 0) {
            Object[][] defaultLocs = {
                {"Library", 19.0645, 72.8358},
                {"Media Arts Lab", 19.0648, 72.8360},
                {"Hostel 1", 19.0630, 72.8350},
                {"Hostel 3", 19.0632, 72.8352},
                {"Mech Workshop", 19.0640, 72.8340},
                {"Canteen", 19.0642, 72.8345},
                {"Main Gate", 19.0635, 72.8365}
            };
            for (Object[] d : defaultLocs) {
                Location loc = new Location();
                loc.setName((String) d[0]);
                loc.setLat((Double) d[1]);
                loc.setLng((Double) d[2]);
                locationRepository.save(loc);
            }
        }
        return locationRepository.findAll();
    }
}
