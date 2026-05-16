import { Request, Response } from "express"
import { verifyWebhook } from '@clerk/express/webhooks'
import {prisma} from "../configs/prisma.js";
import * as Sentry from "@sentry/node";

const clerkWebhooks = async (req: Request, res: Response) => {
    try {
        const evt = await verifyWebhook(req);

        switch (evt.type) {
            case "user.created": {
                const data = evt.data;

                await prisma.user.create({
                    data : {
                        id : data.id,
                        email : data?.email_addresses?.[0]?.email_address,
                        name : data?.first_name + " " + data?.last_name,
                        image : data?.image_url
                    }
                })
                break;
            }
            case "user.updated": {
                const data = evt.data;
                if (!data.id) break;
                await prisma.user.updateMany({
                    where : {
                        id : data.id
                    },
                    data : {
                        email : data?.email_addresses[0]?.email_address,
                        name : data?.first_name + " " + data?.last_name,
                        image : data?.image_url
                    }
                })
                break;
            }
            case "user.deleted": {
                const data = evt.data;
                if (!data.id) break;
                await prisma.user.deleteMany({
                    where : {
                        id : data.id
                    }
                })
                break;
            }

            case "paymentAttempt.updated": {
                const data = evt.data;
                if((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid"){
                    const credits = {
                        pro : 80,
                        premium : 240,
                    }

                    const clerkUserId = data?.payer?.user_id;
                    const planId = data?.subscription_items?.[0]?.plan?.slug;

                    if (!clerkUserId) break;

                    if(planId !== "pro" && planId !== "premium"){
                        return res.status(400).json({message : "Invalid plan"});
                    } 

                    console.log(planId);

                    await prisma.user.update({
                        where : {
                            id : clerkUserId
                        },
                        data : {
                            credits : {
                                increment : credits[planId]
                            }
                        }
                    })
                }
                break;
            }
                            
        
            default:
                break;
        }

        return res.json({message : "Webhook received : " + evt.type});
    } catch (error) {
        console.error("Error processing webhook:", error);
        Sentry.captureException(error);
        return res.status(500).json({message : "Internal server error"});
    }
}

export default clerkWebhooks;