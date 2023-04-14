const axios = require("axios").default;



const getInvoice = (id, goods, orderId) => {
      const invoice = {
            provider_token: "381764678:TEST:53293",
            start_parameter: "get_access", //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
            title: "Hello",
            description: "World",
            currency: "RUB",
            prices: goods.map((item) => ({
                label: `${item.caption} x ${item.count}`,
                amount: (item.sale * item.count * 100).toFixed(0),
            })),
            payload: {
                orderId: orderId,
            },
        };

  return invoice;
};

const post = (bot) => {
  if (!bot) {
    return (req, res) => {
      res.status(404).send({ error: "Bot not found" });
    };
  }

  return (req, res) => {
    const { query_id, goods, user } = req.body;

    bot.telegram
      .answerWebAppQuery(query_id, {
        type: "article",
        id: query_id,
        title: "TEST",
        input_message_content: {
          message_text: `Order summary:\n\n${goods
            .map(
              ({ id, count, sale }) =>
                `${count.toFixed(2)} x ${sale.toFixed(2)} = ${(
                  sale * count
                ).toFixed(2)}`
            )
            .join("\n")}\n\nTotal - ${goods
            .reduce((prev, next) => prev + next.sale * next.count, 0)
            .toFixed(2)}`,
        },
      })
      // .then(async (data) => {
      //   const order = await crateOrderAndUser(user, goods);
      //   if (user) {
      //     bot.telegram.sendInvoice(
      //       user.id,
      //       getInvoice(user.id, goods, order.id)
      //     );
      //   }
      //   res.status(200).send({ done: true });
      // })
      .catch((error) => {
        res.status(500).send({ done: false, error: error.message });
      });
  };
}

const postSendInvoice = (bot) => {
  return async (req, res) => {
    const { goods } = req.body;
    axios
      .post(
        `https://api.telegram.org/bot${process.env.TOKEN}/createInvoiceLink`,
        getInvoice(100, Array.isArray(goods) ? goods : [], "TestOrder")
      )
      .then((response) => {
        console.log(response.data);
        res.status(200).send({ done: true, ...response.data });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({ done: false, error: error.message });
      });
  };
};

module.exports = (router, bot) => {
  router.post("/", post(bot));
  router.post("/sendInvoice", postSendInvoice(bot));
};


// import axios from "axios"

// class BotAnswer {
//   async getInvoice  (id, goods, orderId) {

//     const invoice = {
//         provider_token: "381764678:TEST:53293",
//         start_parameter: "get_access", //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
//         title: "Hello",
//         description: "World",
//         currency: "RUB",
//         prices: goods.map((item) => ({
//             label: `${item.caption} x ${item.count}`,
//             amount: (item.sale * item.count * 100).toFixed(0),
//         })),
//         payload: {
//             orderId: orderId,
//         },
//     };

// return invoice;
// };

// async Post  (bot)  {
// if (!bot) {
//   return (req, res) => {
//     res.status(404).send({ error: "Bot not found" });
//   };
// }

// return (req, res) => {
//   const { query_id, goods, user } = req.body;

//   bot.telegram
//     .answerWebAppQuery(query_id, {
//       type: "article",
//       id: query_id,
//       title: "TEST",
//       input_message_content: {
//         message_text: `Order summary:\n\n${goods
//           .map(
//             ({ id, count, sale }) =>
//               `${count.toFixed(2)} x ${sale.toFixed(2)} = ${(
//                 sale * count
//               ).toFixed(2)}`
//           )
//           .join("\n")}\n\nTotal - ${goods
//           .reduce((prev, next) => prev + next.sale * next.count, 0)
//           .toFixed(2)}`,
//       },
//     })
//     // .then(async (data) => {
//     //   const order = await crateOrderAndUser(user, goods);
//     //   if (user) {
//     //     bot.telegram.sendInvoice(
//     //       user.id,
//     //       getInvoice(user.id, goods, order.id)
//     //     );
//     //   }
//     //   res.status(200).send({ done: true });
//     // })
//     .catch((error) => {
//       res.status(500).send({ done: false, error: error.message });
//     });
// };
// };

// async postSendInvoice (bot) {

// return async (req, res) => {
  
//   const { goods } = req.body;
  
//  //bot.telegram.sendInvoice(5884276075, getInvoice(5884276075))
//   axios
  
//     .post(
//       `https://api.telegram.org/bot${process.env.TOKEN}/createInvoiceLink`,
//       getInvoice(100, Array.isArray(goods) ? goods : [], "TestOrder")
//     )
//     .then((response) => {
//       console.log(response.data);
//       res.status(200).send({ done: true, ...response.data });
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(500).send({ done: false, error: error.message });
//     });
// };
// };

// }

// export default new BotAnswer()