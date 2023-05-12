import TokenData from "../../models/token"
import { Request, Response } from "express"
import axios from "axios"

export const get = async (req: Request, res: Response) => {
  try {
    const { workspace_id, user_id } = req.body
    const id = `${workspace_id}:${user_id}`
    const data = await TokenData.findOne({ id })
    if (!data) throw new Error("token not found")

    let isPremium = false
    const license_key = data.license_key
    if (license_key) {
      try {
        const product_id = process.env.PRODUCT_ID
        if (!product_id) throw new Error("can't find PRODUCT_ID .env variable")
        const gumroadRes = await axios.post(
          "https://api.gumroad.com/v2/licenses/verify",
          {
            product_id,
            license_key,
          }
        )
        isPremium = gumroadRes.data.success
      } catch (err) {
        console.error(err)
      }
    }
    res.status(200).send({ token: data.access_token, isPremium })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      message: "Something went wrong",
      error: JSON.stringify(err),
    })
  }
}

const nani = {
  message: "Request failed with status code 404",
  name: "AxiosError",
  stack:
    "AxiosError: Request failed with status code 404\\n    at settle (/opt/render/project/src/node_modules/axios/lib/core/settle.js:19:12)\\n    at BrotliDecompress.handleStreamEnd (/opt/render/project/src/node_modules/axios/lib/adapters/http.js:505:11)\\n    at BrotliDecompress.emit (events.js:388:22)\\n    at BrotliDecompress.emit (domain.js:470:12)\\n    at endReadableNT (internal/streams/readable.js:1336:12)\\n    at processTicksAndRejections (internal/process/task_queues.js:82:21)",
  config: {
    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false,
    },
    adapter: ["xhr", "http"],
    transformRequest: [null],
    transformResponse: [null],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: { Blob: null },
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "User-Agent": "axios/1.2.1",
      "Content-Length": "62",
      "Accept-Encoding": "gzip, compress, deflate, br",
    },
    method: "post",
    url: "https://api.gumroad.com/v2/licenses/verify",
    data: { product_id: "bTPylf33v6gKA_-bXASXSg==", license_key: "true" },
  },
  code: "ERR_BAD_REQUEST",
  status: 404,
}
