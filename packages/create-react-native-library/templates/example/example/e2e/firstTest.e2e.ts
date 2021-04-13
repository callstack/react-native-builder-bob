import { by, device, expect, element } from 'detox';

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('displays multiply result', async () => {
    await expect(element(by.text('Result: 21'))).toBeVisible();
  });

});