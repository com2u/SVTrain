'use strict'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ConvertEmptyStringsToNull {
  public async handle({ request }: HttpContextContract, next: () => Promise<void>) {
    if (Object.keys(request.body).length) {
      Object.keys(request.body).forEach(
        (k) => (request.body[k] = request.body[k] === '' ? null : request.body[k])
      )
    }

    await next()
  }
}

module.exports = ConvertEmptyStringsToNull
