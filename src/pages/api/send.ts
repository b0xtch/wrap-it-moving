import 'dotenv/config';
import nodemailer from 'nodemailer';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, redirect }) => {
  // Setup nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true for port 465, false for port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Parse form data
    const data = await request.formData();

    // Retrieve standard form inputs
    const name = data.get('name');
    const email = data.get('email');
    const phone = data.get('phone');
    const move_date = data.get('move_date');
    const moving_from = data.get('moving_from');
    const moving_from_type = data.get('moving_from_type');
    const elevator_from = data.get('elevator_from');
    const bedrooms_from = data.get('bedrooms_from');
    const moving_to = data.get('moving_to');
    const moving_to_type = data.get('moving_to_type');
    const elevator_to = data.get('elevator_to');
    const bedrooms_to = data.get('bedrooms_to');
    const additional_services = data.get('additional_services');
    const find_us = data.get('find_us');
    const other_find_us = data.get('other_find_us'); // Capture the "Other" field if available
    const additional_info = data.get('additional_info');

    let formattedMoveDate = move_date;
    if (move_date) {
      const date = new Date(move_date.toString());
      formattedMoveDate = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })}, ${date.getFullYear()}`;
    }
    // Construct the "How did you find us?" text with additional details if "Others" is selected
    let findUsText = find_us;
    if (find_us === 'Others' && other_find_us) {
      findUsText += `: ${other_find_us}`;
    }

    // Debug logging to verify file input retrieval
    const files = data.getAll('photos_reference');
    console.log('Files received:', files);

    // Process files for attachment if available
    const attachments = await Promise.all(
      files.map(async (file: any) => {
        if (file instanceof File) {
          const buffer = await file.arrayBuffer();
          return {
            filename: file.name,
            content: Buffer.from(buffer),
            contentType: file.type,
            disposition: 'attachment',
          };
        } else {
          console.log('Skipping non-file item:', file);
          return null;
        }
      })
    );

    // Filter out any null attachments
    const validAttachments = attachments.filter(Boolean);

    // Prepare the email content
    const emailBody = `
  <div style="font-family: Arial, sans-serif; color: #333; font-size: 13px; line-height: 0.7;">
    <h2 style="background-color: #e6f2ff; color: #004085; padding: 4px 0; margin: 0; border-bottom: 1px solid #cce5ff; font-size: 13px;">
      Contact Information
    </h2>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Name:</strong> ${name}</p>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Phone:</strong> ${phone}</p>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #004085;">${email}</a></p>

    <h2 style="background-color: #e6f2ff; color: #004085; padding: 4px 0; margin: 0; border-bottom: 1px solid #cce5ff; font-size: 13px;">
      Move Date
    </h2>
   <p style="margin: 2px 0; padding-left: 8px;"><strong>Date:</strong> ${formattedMoveDate}</p>

    <h2 style="background-color: #e6f2ff; color: #004085; padding: 4px 0; margin: 0; border-bottom: 1px solid #cce5ff; font-size: 13px;">
      Move Details
    </h2>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Starting Location:</strong> ${moving_from} (${moving_from_type})</p>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Elevator Access at Start:</strong> ${elevator_from}</p>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Bedrooms at Start:</strong> ${bedrooms_from}</p>
    
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Destination:</strong> ${moving_to} (${moving_to_type})</p>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Elevator Access at Destination:</strong> ${elevator_to}</p>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Bedrooms at Destination:</strong> ${bedrooms_to}</p>
    
    <h2 style="background-color: #e6f2ff; color: #004085; padding: 4px 0; margin: 0; border-bottom: 1px solid #cce5ff; font-size: 13px;">
      Additional Details
    </h2>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Service(s) Needed:</strong> ${additional_services}</p>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>How did you find us?</strong> ${findUsText}</p>
    <p style="margin: 2px 0; padding-left: 8px;"><strong>Additional Information:</strong> ${additional_info}</p>
  </div>
`;




    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'info.wrapitmoving@gmail.com',
      subject: 'Quote Submission from Website',
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>'),
      attachments: validAttachments,
    });

    console.log('Email sent successfully');
    return redirect(`/thank-you`);
  } catch (error) {
    console.error('Failed to send email:', error);
    return new Response('Failed to send email', { status: 500 });
  }
};
