import type { APIRoute } from 'astro'
//import sendGrid from '@sendgrid/mail';
import * as sendGrid from '@sendgrid/mail';


const key = import.meta.env.SENDGRID_API_KEY;

sendGrid.setApiKey(key);

export const POST: APIRoute = async ({ request, redirect }) => {
    try{
      // Getting posted data from our contact form
      const data = await request.formData();
      const name = data.get('name');
      const email = data.get('email');
      const phone = data.get('phone');
      const move_date = data.get('move_date');
      const additional_info = data.get('additional_info');
    
        // Sending email
        const msg = {
            to: 'info.wrapitmoving@gmail.com', // Change to your recipient
            from: 'info.wrapitmoving@gmail.com', // Change to your verified sender
            subject: 'Quote Submission from website',
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMove Date: ${move_date}\n\n${additional_info}`,
            html: `Name: ${name}<br/>Email: ${email}<br/>Phone: ${phone}<br/>Move Date: ${move_date}<br/><br/>${additional_info}`,
        }
        
        await sendGrid.send(msg).then(() => {
          console.log('Email sent')
        }).catch((error) => {
          console.error(error)
        });
    
      } catch (error) {
        console.error(error);
      }

    return redirect(`/`);
}
