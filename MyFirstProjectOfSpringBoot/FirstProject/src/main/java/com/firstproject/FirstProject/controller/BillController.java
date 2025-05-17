package com.firstproject.FirstProject.controller;

import com.firstproject.FirstProject.model.Bill;
import com.firstproject.FirstProject.model.BillItem;
import com.firstproject.FirstProject.model.Product;
import com.firstproject.FirstProject.service.BillService;
import com.firstproject.FirstProject.service.PdfService;

import com.itextpdf.text.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private BillService billService;

    @Autowired
    private PdfService pdfService;

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateBill(
            @RequestParam String customerName,
            @RequestParam String customerPhone,
            @RequestBody List<Map<String, Object>> items // Changed to accept generic map
    ) throws IOException, DocumentException {

        // Convert request items to BillItems
        List<BillItem> billItems = items.stream()
                .map(item -> {
                    Product product = new Product();
                    product.setId(Long.parseLong(item.get("productId").toString()));

                    BillItem billItem = new BillItem();
                    billItem.setProduct(product);
                    billItem.setQuantity(Integer.parseInt(item.get("quantity").toString()));
                    return billItem;
                })
                .collect(Collectors.toList());

        Bill bill = billService.generateBill(customerName, customerPhone, billItems);
        byte[] pdfBytes = pdfService.generatePdf(bill);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bill.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills() {
        List<Bill> bills = billService.getAllBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/customer")
    public ResponseEntity<byte[]> getBillsByCustomerPhone(@RequestParam String phone) throws DocumentException, IOException {
        List<Bill> bills = billService.getBillsByCustomerPhone(phone);
        if (bills.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No bills found");
        }
        byte[] pdf = pdfService.generatePdf(bills.get(0));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bill.pdf")
                .body(pdf);
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

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Bill>> getBillsByDate(@PathVariable String date) {
        List<Bill> bills = billService.getBillsByDate(LocalDate.parse(date));
        return ResponseEntity.ok(bills);
    }
}