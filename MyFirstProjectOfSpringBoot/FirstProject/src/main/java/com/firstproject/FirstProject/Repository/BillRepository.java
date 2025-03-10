package com.firstproject.FirstProject.Repository;

import com.firstproject.FirstProject.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByCustomerPhone(String customerPhone);
    List<Bill> findByDate(LocalDate date);
    Optional<Bill>findByInvoiceNumber(String invoiceNumber);
}
