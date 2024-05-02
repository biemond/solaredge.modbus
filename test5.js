console.log('-------------------')

                let hour = 23

                let load = 0
                let batt = 32
                let grid = 64

                let enabled = 128
                let disable = 0

                var value2 =  40960 ;// ((23+64+128) * 256) + 12;
                // var value3 = (23 * 256) + 59;

                let lowVal = value2 & 0xFF;


                let highval = (value2 >> 8) & 0xFF;
                let bit0 = (highval & (1<<0)); 
                let bit1 = (highval & (1<<1));                                 
                let bit2 = (highval & (1<<2)); 
                let bit3 = (highval & (1<<3)); 
                let bit4 = (highval & (1<<4));                                 
                let bit5 = (highval & (1<<5)); 
                let bit6 = (highval & (1<<6));                                 
                let bit7 = (highval & (1<<7)); 

                console.log("low: "+ lowVal );
                console.log("high: "+ highval);
                console.log('bit0 ' + bit0 );
                console.log('bit1 ' + bit1 );
                console.log('bit2 ' + bit2 );
                console.log('bit3 ' + bit3 );
                console.log('bit4 ' + bit4 );
                console.log('bit5 ' + bit5 );
                console.log('bit6 ' + bit6 );
                console.log('bit7 ' + bit7 );

                let priorityPeriod1 = "";
                if ((bit5 + bit6) == 0) {
                    priorityPeriod1 = "load";
                } else if ((bit5 + bit6) == 32) {
                    priorityPeriod1 = "battery";
                } else if ((bit5 + bit6) == 64) {
                    priorityPeriod1 = "grid";
                }
                console.log('priorityPeriod1 ' + priorityPeriod1 );   


                // let lowVal2 = value3 & 0xFF;
                // let highval2 = (value3 >> 8) & 0xFF;
                // let bit20 = (highval2 & (1<<0)); 
                // let bit21 = (highval2 & (1<<1));                                 
                // let bit22 = (highval2 & (1<<2)); 
                // let bit23 = (highval2 & (1<<3)); 
                // let bit24 = (highval2 & (1<<4));                                 
                // let bit25 = (highval2 & (1<<5)); 
                // let bit26 = (highval2 & (1<<6));                                 
                // let bit27 = (highval2 & (1<<7)); 

                // console.log("low: "+ lowVal2 );
                // console.log("high: "+ highval2);
                // console.log('bit0 ' + bit20 );
                // console.log('bit1 ' + bit21 );
                // console.log('bit2 ' + bit22 );
                // console.log('bit3 ' + bit23 );
                // console.log('bit4 ' + bit24 );
                // console.log('bit5 ' + bit25 );
                // console.log('bit6 ' + bit26 );
                // console.log('bit7 ' + bit27 );
