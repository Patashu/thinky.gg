import isGuest from '@root/helpers/isGuest';
import { logger } from '@root/helpers/logger';
import UserConfig from '@root/models/db/userConfig';
import { Types } from 'mongoose';
import type { NextApiResponse } from 'next';
import Theme from '../../../constants/theme';
import { ValidArray, ValidNumber, ValidType } from '../../../helpers/apiWrapper';
import withAuth, { NextApiRequestWithAuth } from '../../../lib/withAuth';
import { UserConfigModel } from '../../../models/mongoose';

export async function getUserConfig(userId: Types.ObjectId) {
  let userConfig = await UserConfigModel.findOne<UserConfig>({ userId: userId }, { '__v': 0 }, { lean: true });

  if (!userConfig) {
    userConfig = await UserConfigModel.create({
      _id: new Types.ObjectId(),
      theme: Theme.Modern,
      userId: userId,
    });
  }

  return userConfig;
}

export default withAuth({
  // NB: GET API currently unused - UserConfig returned through /api/user
  GET: {},
  PUT: {
    body: {
      deviceToken: ValidType('string', false),
      emailDigest: ValidType('string', false),
      emailNotificationsList: ValidArray(false),
      pushNotificationsList: ValidArray(false),
      showPlayStats: ValidType('boolean', false),
      theme: ValidType('string', false),
      tutorialCompletedAt: ValidNumber(false),
      toursCompleted: ValidArray(false),
    }
  },
}, async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const userConfig = await getUserConfig(req.user._id);

    return res.status(200).json(userConfig);
  } else if (req.method === 'PUT') {
    const {
      deviceToken,
      emailDigest,
      emailNotificationsList,
      pushNotificationsList,
      showPlayStats,
      theme,
      toursCompleted,
      tutorialCompletedAt,
    } = req.body;

    const setObj: {[k: string]: string} = {};

    if (emailDigest !== undefined) {
      setObj['emailDigest'] = emailDigest;

      if (isGuest(req.user)) {
        return res.status(400).json({
          error: 'Guests cannot change email digest settings. Confirm your email to convert your account.',
        });
      }
    }

    if (showPlayStats !== undefined) {
      setObj['showPlayStats'] = showPlayStats;
    }

    if (theme !== undefined) {
      setObj['theme'] = theme;
    }

    if (tutorialCompletedAt) {
      setObj['tutorialCompletedAt'] = tutorialCompletedAt;
    }

    if (toursCompleted) {
      setObj['toursCompleted'] = toursCompleted;
    }

    if (emailNotificationsList) {
      setObj['emailNotificationsList'] = emailNotificationsList;
    }

    if (pushNotificationsList) {
      setObj['pushNotificationsList'] = pushNotificationsList;
    }

    // check if setObj is blank
    if (!deviceToken && Object.keys(setObj).length === 0) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      const updateResult = await UserConfigModel.updateOne({ userId: req.userId }, { $set: setObj, $addToSet: { mobileDeviceTokens: deviceToken } });

      /* istanbul ignore next */
      if (updateResult.acknowledged === false) {
        return res.status(500).json({ error: 'Error updating config', updated: false });
      }
    } catch (err) {
      logger.error(err);

      return res.status(500).json({ error: 'Error updating config', updated: false });
    }

    return res.status(200).json({ updated: true });
  }
});
