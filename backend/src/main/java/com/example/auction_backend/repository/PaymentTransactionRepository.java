package com.example.auction_backend.repository;
import com.example.auction_backend.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, String> {

}
