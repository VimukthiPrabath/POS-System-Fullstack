package com.vimukthi.pos_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test")
    public String helloVimukthi() {
        return "Hello Vimukthi! Server eka 100% weda karanawa!";
    }
}