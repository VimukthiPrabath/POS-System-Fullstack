package com.vimukthi.pos_backend.controller;

import com.vimukthi.pos_backend.entity.Product;
import com.vimukthi.pos_backend.entity.Sale;
import com.vimukthi.pos_backend.repository.ProductRepository;
import com.vimukthi.pos_backend.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:3000")
public class SaleController {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    public String placeOrder(@RequestBody Map<String, Object> requestData) {

        Long productId = Long.valueOf(requestData.get("productId").toString());
        int qtyToBuy = Integer.parseInt(requestData.get("quantity").toString());


        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product එක හොයාගන්න බැහැ!"));


        if (product.getQuantity() < qtyToBuy) {
            return "Error: තොග ප්‍රමාණය ප්‍රමාණවත් නැත! (දැනට ඉතිරි ප්‍රමාණය: " + product.getQuantity() + ")";
        }


        product.setQuantity(product.getQuantity() - qtyToBuy);
        productRepository.save(product);


        double total = product.getPrice() * qtyToBuy;


        Sale sale = new Sale();
        sale.setTotalAmount(total);
        sale.setOrderDate(LocalDateTime.now());

        saleRepository.save(sale);

        return "Success: බිල සාර්ථකව ඇතුලත් කරන ලදී! මුළු මුදල: Rs." + total;
    }
}