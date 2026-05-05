import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController();
  });

  describe('root', () => {
    it('should return the authenticated app status payload', () => {
      expect(
        appController.getStatus({
          id: 'user-1',
          username: 'tester',
        }),
      ).toEqual({
        status: 'ok',
        user: {
          id: 'user-1',
          username: 'tester',
        },
      });
    });
  });
});
