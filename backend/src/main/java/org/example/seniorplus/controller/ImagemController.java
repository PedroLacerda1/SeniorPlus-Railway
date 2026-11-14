package org.example.seniorplus.controller;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Imagem;
import org.example.seniorplus.service.ElderlyAccessService;
import org.example.seniorplus.service.ImagemService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/idosos/{cpf}/anexos")
@RequiredArgsConstructor
public class ImagemController {
	private final ImagemService imagemService;
	private final ElderlyAccessService accessService;

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Imagem> upload(@PathVariable String cpf, @RequestParam("arquivo") MultipartFile arquivo,
										 Principal principal) throws IOException {
		String authorizedCpf = accessService.requireResidentAccess(cpf, principal);
		return ResponseEntity.status(201).body(imagemService.upload(authorizedCpf, arquivo));
	}

	@GetMapping
	public List<Imagem> listar(@PathVariable String cpf, Principal principal) {
		return imagemService.listarPorCpf(accessService.requireResidentAccess(cpf, principal));
	}
}
