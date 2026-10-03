package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Imagem;
import org.example.seniorplus.repository.ImagemRepository;
import org.example.seniorplus.service.exception.ServiceOperationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ImagemService {

    private final ImagemRepository imagemRepository;

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
