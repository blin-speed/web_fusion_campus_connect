package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Dispute;
import com.campuscircular.backend.exception.ApiException;
import com.campuscircular.backend.repository.DisputeRepository;
import com.campuscircular.backend.security.AuthContext;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/disputes")
public class DisputeController {

    private final DisputeRepository disputeRepository;

    public DisputeController(DisputeRepository disputeRepository) {
        this.disputeRepository = disputeRepository;
    }

    @GetMapping("/mine")
    public List<Dispute> mine() {
        Long userId = AuthContext.getUserId();
        return disputeRepository.findAll().stream()
                .filter(d -> (d.getRaisedBy() != null && d.getRaisedBy().getId().equals(userId)) ||
                             (d.getExchange() != null && (
                                     (d.getExchange().getBorrower() != null && d.getExchange().getBorrower().getId().equals(userId)) ||
                                     (d.getExchange().getOwner() != null && d.getExchange().getOwner().getId().equals(userId))
                             )))
                .toList();
    }

    @GetMapping("/{id}")
    public Dispute detail(@PathVariable Long id) {
        return disputeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Dispute not found"));
    }

    @PostMapping("/{id}/evidence")
    public Dispute evidence(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Dispute d = detail(id);
        if (payload != null && payload.get("evidenceNotes") != null) {
            String note = payload.get("evidenceNotes").toString();
            String existing = d.getReason() != null ? d.getReason() : "";
            d.setReason(existing + " | Evidence: " + note);
            return disputeRepository.save(d);
        }
        return d;
    }
}
