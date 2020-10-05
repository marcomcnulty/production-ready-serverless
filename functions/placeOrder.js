const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis();
const streamName = process.env.order_events_stream;
const chance = require('chance').Chance();

module.exports.handler = async event => {
  const restaurantName = JSON.parse(event.body).restaurantName;
  const userEmail = event.requestContext.authorizer.claims.email;
  const orderId = chance.guid();

  console.log(`Placing order id: ${orderId} at restaurant: ${restaurantName} by user: ${userEmail}`);

  const data = {
    orderId,
    userEmail,
    restaurantName,
    eventType: 'order_placed'
  };

  const putReq = {
    Data: JSON.stringify(data),
    PartitionKey: orderId,
    StreamName: streamName
  };

  await kinesis.putRecord(putReq).promise();

  console.log('published order_placed event to kinesis');

  return {
    statusCode: 200,
    body: JSON.stringify({ orderId })
  };
}
