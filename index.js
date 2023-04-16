import config from 'dotenv/config'
import express from 'express'
import sequelize from './sequelize.js'
import * as mapping from './models/mapping.js'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import cookieParser from 'cookie-parser'
import router from './routes/index.js'
import errorMiddleware from './middleware/errorMiddleware.js'
import {Telegraf} from "telegraf"
//import BotAnswer from './controllers/botAnswer.js'






const WAurl = 'https://ihatepineapples.ru';
const PORT = process.env.PORT || 3001
const app = express()
const bot = new Telegraf(process.env.TOKEN) 

// Cross-Origin Resource Sharing
app.use(cors({origin: ['http://192.168.0.2:3000'], credentials: true}))
// middleware для работы с json
app.use(express.json())
// middleware для статики (img, css)
app.use(express.static('static'))
// middleware для загрузки файлов
app.use(fileUpload())
// middleware для работы с cookie
app.use(cookieParser(process.env.SECRET_KEY))
// обработка ошибок
app.use(errorMiddleware)
// все маршруты приложения
app.use('/api', router)

const shippingOptions = [
    {
      id: 'unicorn',
      title: 'Unicorn express',
      prices: [{ label: 'Unicorn', amount: 2000 }]
    },
    {
      id: 'slowpoke',
      title: 'Slowpoke mail',
      prices: [{ label: 'Slowpoke', amount: 100 }]
    }
  ]


bot.use(Telegraf.log())

bot.command('start', async (ctx) => ctx.reply('Нажмите, чтобы сделать заказ', {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Заказать', web_app:{url: WAurl}}]
        ]
     }
 }));
//  bot.on('shipping_query', ({ answerShippingQuery }) => answerShippingQuery(true, shippingOptions))
 
// const getInvoice = (id) => {
//   const invoice = {
//     chat_id: id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
//     provider_token: process.env.PROVIDER_TOKEN, // токен выданный через бот @SberbankPaymentBot 
//     start_parameter: 'get_access', //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
//     title: 'InvoiceTitle', // Название продукта, 1-32 символа
//     description: 'InvoiceDescription', // Описание продукта, 1-255 знаков
//     currency: 'RUB', // Трехбуквенный код валюты ISO 4217
//     prices: [{ label: 'Invoice Title', amount: 100 * 100 }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
//     payload: { // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
//       unique_id: `${id}_${Number(new Date())}`,
//       provider_token: process.env.PROVIDER_TOKEN 
//     }
//   }

//   return invoice
// }

// bot.hears('pay', (ctx) => {  // это обработчик конкретного текста, данном случае это - "pay"
//   return ctx.replyWithInvoice(getInvoice(ctx.from.id)) //  метод replyWithInvoice для выставления счета  
// })

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) // ответ на предварительный запрос по оплате

bot.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
  await ctx.reply('Successful Payment')
})


bot.launch()


// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const text = msg.text;
//     if (text === '/start'){
       
//         await bot.sendMessage(chatId, 'Thanks for your message, visit our site', {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{text: 'Place an order', web_app:{url: WAurl}}]
//                 ]
//              }
//          })
    
  
         
//         //  await bot.sendMessage(chatId, 'Fill in the form down!', {
//         //     reply_markup: {
//         //     keyboard: [
//         //             [{text: 'Info', web_app:{url: WAurl + '/form'}}]
//         //         ]
//         //      }
//         //  })
//     }

    

// //     // if (msg?.web_app_data?.data){
// //     //     try{
// //     //         const data = JSON.parse(msg?.web_app_data?.data);
// //     //         console.log(data)
// //     //         await bot.sendMessage(chatId,'Information is accepted');
// //     //         await bot.sendMessage(chatId, 'Your street is ' + data?.address);
// //     //     } catch (e) {
// //     //         console.log(e);
// //     //     }
       
// //     // }
    
//   });

  

//в конце запостить информацию о заказе в чат

  app.post('/web-data', async (req,res) => {
    const { products = [], totalPrice, queryId} = req.body;
        try {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Successful!',
                input_message_content: {message_text:'All done, total amount spent: ' + totalPrice}
            })
            return res.status(200).json({});
        } catch (e) {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Something went wrong',
                input_message_content: {message_text:'Something went wrong'}
            })
            return res.status(500).json({});
        }
        
})

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log('Сервер запущен на порту', PORT))
    } catch(e) {
        console.log(e)
    }
}

start()
