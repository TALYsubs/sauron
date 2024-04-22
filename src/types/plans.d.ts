export type WhereClause = Record<string, any>;

export interface Context {
  authorization?: string | null;
  actor: string | null;
  group: string | null;
}

// Mutations
export interface Template {
  product_selection?: string;
  pricing_type?: string;
  plan_price?: any;
}

export interface BundleFeature {
  bundle_definition: {
    groups: [
      {
        name: string;
        quantity: number;
        products: [number];
      }
    ];
  };
}

export interface PlanSection {
  title: string;
  type: string;
  criteria: (
    prisma: any,
    userLocation?: any,
    page: number,
    size: number,
    categories?: any
  ) => Promise<any>;
}

export interface GroupedPrice {
  country: string;
  currency: string;
  amount: number;
}

export type SpecialFilter = Record<
  string,
  {
    type: string;
    criteria: (
      prisma: any,
      userLocation: any,
      page: number,
      size: number,
      categories: any
    ) => Promise<any>;
  }
>;

interface PlanDTO {
  plan_type: string;
  title: string;
  slug?: string;
  products?: any[];
  plan_features?: unknown;
  bundle_definition?: any[];
  plan_price?: unknown;
  template?: unknown;
  plan_type?: string;
}
