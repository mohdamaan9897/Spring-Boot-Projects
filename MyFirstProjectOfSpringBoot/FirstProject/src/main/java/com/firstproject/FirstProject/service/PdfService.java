package com.firstproject.FirstProject.service;

import com.firstproject.FirstProject.model.Bill;
import com.firstproject.FirstProject.model.BillItem;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PdfService {

    public byte[] generatePdf(Bill bill) throws DocumentException, IOException {
        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Add shop details
        Font shopFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
        Paragraph shopDetails = new Paragraph("Faizi Mobile - Invoice\n\n", shopFont);
        shopDetails.add("Shop Name: Faizi Mobile\n");
        shopDetails.add("Address: 123 Main Street, City, Country\n");
        shopDetails.add("Contact: +918273092848\n");
        shopDetails.add("GST Number: GST123456789\n\n");
        document.add(shopDetails);

        // Add customer details
        Font customerFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
        Paragraph customerDetails = new Paragraph("Customer Details:\n", customerFont);
        customerDetails.add("Customer Name: " + bill.getCustomerName() + "\n");
        customerDetails.add("Phone Number: " + bill.getCustomerPhone() + "\n");
        customerDetails.add("Invoice Number: " + bill.getInvoiceNumber() + "\n");
        customerDetails.add("Date: " + bill.getDate() + "\n\n");
        document.add(customerDetails);

        // Add bill items table
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);

        // Add table headers
        Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
        table.addCell(new Phrase("Product", tableHeaderFont));
        table.addCell(new Phrase("Quantity", tableHeaderFont));
        table.addCell(new Phrase("Price", tableHeaderFont));

        // Add table rows
        Font tableContentFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
        for (BillItem item : bill.getItems()) {
            // Ensure the product is not null
            if (item.getProduct() == null) {
                throw new RuntimeException("Product is null in BillItem");
            }

            table.addCell(new Phrase(item.getProduct().getBrand() + " " + item.getProduct().getModel(), tableContentFont));
            table.addCell(new Phrase(String.valueOf(item.getQuantity()), tableContentFont));
            table.addCell(new Phrase("Rs." + item.getProduct().getPrice(), tableContentFont));
        }

        document.add(table);

        // Add totals
        Paragraph totals = new Paragraph("\nSubtotal: Rs." + bill.getTotalAmount() + "\n", customerFont);
        totals.add("GST (18%): Rs" + bill.getGstAmount() + "\n");
        totals.add("Grand Total: Rs." + bill.getGrandTotal() + "\n\n");
        document.add(totals);

        // Add notes
        Paragraph notes = new Paragraph("Notes:\n", customerFont);
        notes.add("• Products sold are non-refundable.\n");
        notes.add("• Warranty applicable as per company policy.\n\n");
        document.add(notes);

        // Add footer
        Paragraph footer = new Paragraph("Thank you for shopping with us!\n", customerFont);
        footer.add("For any queries, contact us at +918273092848.\n");
        document.add(footer);

        document.close();
        return outputStream.toByteArray();
    }
}