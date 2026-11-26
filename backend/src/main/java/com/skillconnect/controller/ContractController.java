package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.contract.ContractDto;
import com.skillconnect.dto.contract.CreateContractRequest;
import com.skillconnect.service.ContractService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ContractDto>> create(@Valid @RequestBody CreateContractRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Contract created", contractService.createContract(request)));
    }

    @GetMapping("/{contractId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ContractDto>> getById(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getContractById(contractId)));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<ContractDto>>> myContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getMyContracts(page, size)));
    }

    @PatchMapping("/{contractId}/accept")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<ContractDto>> accept(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok("Contract accepted", contractService.freelancerAcceptContract(contractId)));
    }

    @PatchMapping("/{contractId}/decline")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<ContractDto>> decline(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok("Contract declined", contractService.freelancerDeclineContract(contractId)));
    }

    @PatchMapping("/{contractId}/complete")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ContractDto>> complete(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok("Contract marked complete", contractService.markComplete(contractId)));
    }
}
