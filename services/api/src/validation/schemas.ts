import Joi from 'joi';
import { EVENT_TYPES, LIMITS } from '../constants/config';

/**
 * Ingest event schema
 */
const ingestEventSchema = Joi.object({
  type: Joi.string()
    .valid(EVENT_TYPES.WEB_VITAL, EVENT_TYPES.RESOURCE, EVENT_TYPES.ERROR)
    .required(),
  name: Joi.string().required(),
  value: Joi.number().optional(),
  data: Joi.any().optional(),
  ts: Joi.number().required(),
  page: Joi.string().required(),
  sessionId: Joi.string().required(),
});

/**
 * Ingest request schema
 */
export const ingestSchema = Joi.object({
  projectKey: Joi.string().required(),
  events: Joi.array()
    .items(ingestEventSchema)
    .max(LIMITS.MAX_EVENTS_PER_REQUEST)
    .required(),
}).required();

/**
 * Error request schema
 */
export const errorSchema = Joi.object({
  projectKey: Joi.string().required(),
  error: Joi.object({
    message: Joi.string().required(),
    stack: Joi.string().optional(),
  }).required(),
  page: Joi.string().required(),
  sessionId: Joi.string().optional(),
  timestamp: Joi.number().optional(),
  userAgent: Joi.string().optional(),
  deviceType: Joi.string().optional(),
  browser: Joi.string().optional(),
  country: Joi.string().optional(),
}).required();

