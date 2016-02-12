#randomising eggo allo sequence
#picks half trials from the fiven sequence
set.seed(666)
SelectAllocentricTrials  = function(int1,int2){
	egoallo = c(int1:int2)
	final = sample(egoallo,size = (length(egoallo)/2),replace=F)
	a = paste(final,collapse=",")
	return(a)
}
#first generation