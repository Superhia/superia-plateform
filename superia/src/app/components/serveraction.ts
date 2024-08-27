'use server';

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };

  // Here you can add your logic to process the form data, e.g., save it to a database
  console.log('Invoice created:', rawFormData);

  // Return any response you need
  return {
    success: true,
    data: rawFormData,
  };
}