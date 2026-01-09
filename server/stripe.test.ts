import { describe, it, expect, beforeAll } from 'vitest';
import { products, getProductById } from './products';

describe('Stripe Products', () => {
  it('should have all required products defined', () => {
    const requiredProductIds = [
      'booking_deposit',
      'weight_loss_core',
      'weight_loss_plus',
      'weight_loss_intensive',
      'womens_hormone',
      'mens_hair_loss',
      'mens_ed',
      'mens_bundle',
      'peptide_therapy'
    ];

    requiredProductIds.forEach(id => {
      const product = getProductById(id);
      expect(product).toBeDefined();
      expect(product?.id).toBe(id);
    });
  });

  it('should have valid prices for all products', () => {
    products.forEach(product => {
      expect(product.priceInCents).toBeGreaterThan(0);
      expect(typeof product.priceInCents).toBe('number');
    });
  });

  it('should have correct subscription/one-time intervals', () => {
    // Booking deposit should be one-time
    const deposit = getProductById('booking_deposit');
    expect(deposit?.interval).toBe('one_time');

    // All memberships should be monthly subscriptions
    const subscriptionIds = [
      'weight_loss_core',
      'weight_loss_plus', 
      'weight_loss_intensive',
      'womens_hormone',
      'mens_hair_loss',
      'mens_ed',
      'mens_bundle',
      'peptide_therapy'
    ];

    subscriptionIds.forEach(id => {
      const product = getProductById(id);
      expect(product?.interval).toBe('month');
    });
  });

  it('should have all required product fields', () => {
    products.forEach(product => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.description).toBeDefined();
      expect(product.priceInCents).toBeDefined();
      expect(product.interval).toBeDefined();
      expect(['one_time', 'month', 'year']).toContain(product.interval);
    });
  });

  it('should return undefined for non-existent product', () => {
    const product = getProductById('non_existent_product');
    expect(product).toBeUndefined();
  });

  it('should have correct prices matching the pricing config', () => {
    // Verify prices match the documented pricing
    expect(getProductById('booking_deposit')?.priceInCents).toBe(5000); // $50
    expect(getProductById('weight_loss_core')?.priceInCents).toBe(14900); // $149
    expect(getProductById('weight_loss_plus')?.priceInCents).toBe(24900); // $249
    expect(getProductById('weight_loss_intensive')?.priceInCents).toBe(34900); // $349
    expect(getProductById('womens_hormone')?.priceInCents).toBe(22900); // $229
    expect(getProductById('mens_hair_loss')?.priceInCents).toBe(5900); // $59
    expect(getProductById('mens_ed')?.priceInCents).toBe(5900); // $59
    expect(getProductById('mens_bundle')?.priceInCents).toBe(9900); // $99
    expect(getProductById('peptide_therapy')?.priceInCents).toBe(24900); // $249
  });
});
