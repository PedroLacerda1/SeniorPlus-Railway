package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Imagem;
import org.example.seniorplus.repository.ImagemRepository;
import org.example.seniorplus.service.exception.ServiceOperationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ImagemService {

    private final ImagemRepository imagemRepository;
    private final AzureStorageService azureStorageService;

    public Imagem upload(String cpf, MultipartFile arquivo) throws IOException {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo obrigatorio.");
        }
        if (!azureStorageService.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Armazenamento indisponivel.");
        }
        String nome = StringUtils.getFilename(StringUtils.cleanPath(
                Objects.toString(arquivo.getOriginalFilename(), "arquivo").replace('\\', '/')));
        if (nome == null || nome.isBlank() || nome.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome de arquivo invalido.");
        }
        Imagem imagem = new Imagem();
        imagem.setCpf(cpf);
        imagem.setNomeArquivo(nome);
        imagem.setTipo(arquivo.getContentType());
        imagem.setDataUpload(LocalDateTime.now());
        imagem.setUrl(azureStorageService.uploadArquivo(arquivo));
        return imagemRepository.save(imagem);
    }

    // Listar todas as imagens
    public List<Imagem> listarTodas() {
        return imagemRepository.findAll();
    }

    // Buscar todas as imagens por CPF
    public List<Imagem> listarPorCpf(String cpf) {
        return imagemRepository.findAllByCpf(cpf);
    }

    // Buscar imagem por ID
    public Imagem buscarPorId(Long id) {
        Objects.requireNonNull(id, "ID da imagem não pode ser nulo");
        return imagemRepository.findById(id)
                .orElseThrow(() -> new ServiceOperationException("Imagem não encontrada com ID: " + id));
    }

    // Salvar nova imagem
    public Imagem salvar(Imagem imagem) {
        Objects.requireNonNull(imagem, "Imagem não pode ser nula");
        return imagemRepository.save(imagem);
    }

    // Atualizar imagem por ID
    public Imagem atualizar(Long id, Imagem novaImagem) {
        Imagem existente = buscarPorId(id);

        existente.setNomeArquivo(novaImagem.getNomeArquivo());
        existente.setUrl(novaImagem.getUrl());
        existente.setTipo(novaImagem.getTipo());
        existente.setDataUpload(novaImagem.getDataUpload());

        return imagemRepository.save(existente);
    }

    // Deletar imagem por ID
    public void deletar(Long id) {
        Imagem imagem = buscarPorId(id);
        imagemRepository.delete(Objects.requireNonNull(imagem));
    }
}
