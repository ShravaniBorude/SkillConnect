package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<?>> users(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String role,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUsers(keyword, role, status, page, size)));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long userId, @RequestBody Map<String, String> body) {
        adminService.updateUserStatus(userId, body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("User status updated", null));
    }

    @GetMapping("/verifications")
    public ResponseEntity<ApiResponse<?>> verifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPendingVerifications(page, size)));
    }

    @PatchMapping("/verifications/{docId}")
    public ResponseEntity<ApiResponse<?>> reviewVerification(
            @PathVariable Long docId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Verification reviewed",
                adminService.reviewVerificationDocument(docId, body.get("status"), body.get("adminNotes"))));
    }

    @GetMapping("/disputes")
    public ResponseEntity<ApiResponse<?>> disputes(
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllDisputes(status, page, size)));
    }

    @PatchMapping("/disputes/{disputeId}/resolve")
    public ResponseEntity<ApiResponse<?>> resolveDispute(
            @PathVariable Long disputeId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Dispute resolved",
                adminService.resolveDispute(disputeId, body.get("resolution"), body.get("adminNotes"))));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<?>> transactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllTransactions(page, size)));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<?>> createCategory(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Category created",
                adminService.createCategory(body.get("name"), body.get("slug"), body.get("description"), body.get("icon"))));
    }

    @PatchMapping("/categories/{categoryId}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleCategory(
            @PathVariable Long categoryId, @RequestBody Map<String, Boolean> body) {
        adminService.toggleCategoryStatus(categoryId, Boolean.TRUE.equals(body.get("active")));
        return ResponseEntity.ok(ApiResponse.ok("Category updated", null));
    }

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<?>> createSkill(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Skill created",
                adminService.createSkill(body.get("name"), body.get("slug"), body.get("categoryHint"))));
    }
}
