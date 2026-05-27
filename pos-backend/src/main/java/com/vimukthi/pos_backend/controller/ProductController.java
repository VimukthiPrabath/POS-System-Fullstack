package com.vimukthi.pos_backend.controller;

import com.vimukthi.pos_backend.entity.Product;
import com.vimukthi.pos_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;


    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }


    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }


    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product එක හොයාගන්න බැහැ!"));


        existingProduct.setName(productDetails.getName());
        existingProduct.setPrice(productDetails.getPrice());
        existingProduct.setQuantity(productDetails.getQuantity());


        return productRepository.save(existingProduct);
    }


    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return "Product එක සාර්ථකව මකා දමන ලදී!";
    }
}