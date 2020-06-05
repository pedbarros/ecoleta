
import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items).split(',').map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return response.json(points);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(404).json({ message: 'Point not found' });
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id).select('title');

    return response.json({ ...point, ...{ items } });
  }

  async create(request: Request, response: Response) {
    try {
      const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;

      const trx = await knex.transaction();

      const point = {
          image: `http://192.168.1.10:3333/uploads/${request.file.filename}`, 
          name, 
          email, 
          whatsapp, 
          latitude, 
          longitude, 
          city, 
          uf 
      };

      const [ids] = await trx('points').insert(point);

      const pointItems = items
        .split(',')
        .map((item: string) => +item.trim())
        .map((item_id: number) => ({ item_id, point_id: ids }))

      await trx('point_items').insert(pointItems);

      await trx.commit();

      return response.json({ id: ids, ...point });
    } catch (error) {
      console.log('===================', error);
    }
  }
}

export default new PointsController();