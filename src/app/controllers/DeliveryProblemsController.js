import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Deliveryman from '../models/Deliveryman';

class DeliveryProblemsController {
  async index(req, res) {
    const deliveries = await Delivery.findAll({
      order: [['created_at', 'DESC']],
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
      ],
      include: [
        {
          model: DeliveryProblem,
          required: true,
        },
      ],
    });

    return res.json(deliveries);
  }

  async show(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id, {
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
      ],
      include: [
        {
          model: DeliveryProblem,
          required: true,
          attributes: ['id', 'description', 'created_at'],
        },
      ],
    });

    return res.json(delivery);
  }

  async destroy(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findOne({
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
        'recipient_id',
        'signature_id',
      ],
      include: [
        {
          model: DeliveryProblem,
          where: { id },
          attributes: ['id', 'description', 'created_at'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    await delivery.update({ canceled_at: new Date() });

    await Queue.add(CancellationMail.key, { delivery });

    return res.json(delivery);
  }
}

export default new DeliveryProblemsController();
