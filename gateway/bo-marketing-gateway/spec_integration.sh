#!/bin/bash
pattern=$1
shift
ComArg=$@
jas='jasmine-node --verbose --junitreport --captureExceptions '$ComArg

if [ -z $pattern ];
then
	pattern='*';
fi

echo 'Starting tests, output is going to spec_res.txt, please wait...'
rm spec_res.log

# Find the tests to run
tests=`find spec/services -name "$pattern.spec.js"`

# reset some vars
num=0;
echo "" > spec_fails.log

# Loop thru the tests
for test in $tests
do
	# It is important that we run each test in a new node process.
	echo "Running: $test"
	$jas $test 2>&1 | tee spec_run.log | tee -a spec_res.log

	# Check if there was a failure and append to the fails file
	fails=`cat spec_run.log | grep assertion | grep -v " 0 failures"`
    if [ -n "$fails" ]
    then
        echo 'FAILED -->>>' $test >> spec_fails.log
        cat spec_run.log >> spec_fails.log
    fi
	let num=num+1;
done

cat spec_res.log | grep assertion
ran=`cat spec_res.log | grep assertion | wc -l`

# Echo the number of tests that were completed vs the total tests
# we first reset the echo colors (\e[0m) and make it highlighted (\e[45m).
echo -e '\e[0m\e[45mTotal tests:' $ran/$num '\e[0m'

if [ $ran != $num ]
then
    echo 'NOT ALL TESTS FINISHED !!'
    exit 1
fi

fails=`cat spec_res.log | grep assertion | grep -v " 0 failures"`
if [ -n "$fails" ]
then
    echo 'TESTS FAILURES !!'
    cat spec_fails.log
    exit 1
fi

echo 'FINISHED SUCCESSFULLY'
exit 0
