package com.firstproject.FirstProject.controller;

import com.firstproject.FirstProject.model.Bill;
import com.firstproject.FirstProject.model.BillItem;
import com.firstproject.FirstProject.service.BillService;
import com.firstproject.FirstProject.service.PdfService;

import com.itextpdf.text.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private BillService billService;

    @Autowired
    private PdfService pdfService;

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateBill(@RequestParam String customerName, @RequestParam String customerPhone, @RequestBody List<BillItem> items) throws IOException, DocumentException {
        Bill bill = billService.generateBill(customerName, customerPhone, items);
        byte[] pdfBytes = pdfService.generatePdf(bill);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "bill_" + bill.getInvoiceNumber() + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    @GetMapping("/customer")
    public ResponseEntity<byte[]> getBillsByCustomerPhone(@RequestParam String phone) throws IOException, DocumentException {
        List<Bill> bills = billService.getBillsByCustomerPhone(phone);
        if (bills.isEmpty()) {
            throw new RuntimeException("No bills found for customer phone: " + phone);
        }

        // Generate PDF for the first bill (or combine all bills into one PDF)
        byte[] pdfBytes = pdfService.generatePdf(bills.get(0));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "bill_customer_" + phone + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<byte[]> getBillByInvoiceNumber(@PathVariable String invoiceNumber) throws IOException, DocumentException {
        Bill bill = billService.getBillByInvoiceNumber(invoiceNumber);
        byte[] pdfBytes = pdfService.generatePdf(bill);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "bill_" + invoiceNumber + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}