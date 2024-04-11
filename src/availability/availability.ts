import { prisma } from '../services/prisma';

const fieldMap = new Map<string, string>([
  ['CITY', 'city'],
  ['STATE', 'state'],
  ['COUNTY', 'county'],
  ['POSTAL_CODE', 'postal_code']
]);

export const checkAvailability4Address = async (userId: number) => {
  // Retrieve the delivery address of that user
  const address = await prisma.address.findFirst({
    where: {
      userId,
      type: 'DELIVERY',
      is_default: true
    }
  });

  if (!address) {
    throw new Error('Delivery address not found');
  }

  // Retrieve the shipping zone rules of all companies
  const companies = await prisma.company.findMany({
    include: {
      shipping_zone: {
        include: {
          shipping_zone_rule: true
        }
      }
    },
    where: {
      published: true
    }
  });

  // Delete existing availability records for that user
  await prisma.availability.deleteMany({
    where: { user_id: userId }
  });

  // Process the user's default address against all rules of each company
  const createAvailabilityPromises = companies
    .map((company) =>
      company.shipping_zone.some((zone) => validateRules(address, zone))
        ? prisma.availability.create({ data: { company_id: company.id, user_id: userId } })
        : null
    )
    .filter(Boolean);

  await Promise.all(createAvailabilityPromises);
};

const validateRules = (address, zone): boolean => {
  if (zone.country !== address.country) return false;
  if (zone.whole_country_delivery && zone.country === address.country) return true;
  let served = false;

  zone.shipping_zone_rule.forEach((zoneRule) => {
    const { field, values = '', pattern = '', type, delivery = true } = zoneRule.rule;
    const addressField = fieldMap.get(field);
    if (addressField) {
      if (type === 'regex') {
        if (addressField in address && address[addressField].match(new RegExp(pattern))) {
          if (!delivery) return false;
          served = true;
        }
      } else if (values.map((item) => item.trim()).includes(address[addressField])) {
        if (!delivery) return false;
        served = true;
      }
    }
  });
  return served;
};
