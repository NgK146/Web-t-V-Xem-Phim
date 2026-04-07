import PayOS from '@payos/node';

const payos = new PayOS(
  'ae99da9f-dcc2-489f-83dd-579e88391fb3',
  '495ec2be-0ec3-4ebe-bfaf-a763d028d726',
  'bdb81320f0af89c65c0f08cae1912bf304ab98af98225157564806a31fbe7580'
);

async function test() {
  try {
    const link = await payos.createPaymentLink({
      orderCode: 12345,
      amount: 50000,
      description: 'Test',
      cancelUrl: 'http://localhost/cancel',
      returnUrl: 'http://localhost/success'
    });
    console.log('createPaymentLink works:', link.checkoutUrl);
  } catch (e) {
    console.log('Error createPaymentLink:', e.message);
  }
}
test();
